"""
Transaction import parser service.

Handles CSV and PDF bank/credit card statement parsing.
PDF parsing uses Mistral Document AI OCR on Azure.
"""

import base64
import io
import logging
import re
from collections import defaultdict
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

import httpx
import pandas as pd
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session as SyncSession

from app.models.transaction import Transaction
from app.services.ocr_utils import extract_ocr_text
from app.schemas.transaction import (
    ImportFileType,
    ImportParseResponse,
    ParsedTransaction,
)

logger = logging.getLogger(__name__)

# --- Column Detection Patterns (case-insensitive) ---

DATE_PATTERNS = [
    "trans date",
    "transaction date",
    "posting date",
    "date",
]
AMOUNT_PATTERNS = ["amount", "amounts"]
DEBIT_PATTERNS = ["debit", "debited", "withdrawal", "withdrawals"]
CREDIT_PATTERNS = ["credit", "credited", "deposit", "deposits"]
DESC_PATTERNS = ["description", "details", "payee", "name"]
MEMO_PATTERNS = ["memo", "notes", "reference", "particulars"]
BALANCE_PATTERNS = ["balance"]


def _fix_year_spanning_dates(transactions: list[ParsedTransaction]) -> None:
    """
    Fix year-spanning statements (e.g. Dec 2025 → Jan 2026).

    If a statement has both early-month (Jan/Feb) and late-month (Nov/Dec)
    dates in the same year, the late-month dates likely belong to the
    previous year.  Modifies transactions in-place.
    """
    if not transactions:
        return
    months = [t.transaction_date.month for t in transactions]
    has_early = any(m <= 2 for m in months)
    has_late = any(m >= 11 for m in months)
    if has_early and has_late:
        for t in transactions:
            if t.transaction_date.month >= 11:
                t.transaction_date = t.transaction_date.replace(
                    year=t.transaction_date.year - 1
                )


def _mark_duplicates(
    transactions: list[ParsedTransaction],
    existing: list,
) -> list[ParsedTransaction]:
    """
    Compare parsed transactions against existing DB records and flag duplicates.

    Duplicate criteria: same date + same absolute amount + similar vendor name
    (first 10 chars lowercased).  Shared by async and sync callers.
    """
    lookup: dict[tuple, list] = defaultdict(list)
    for txn in existing:
        txn_date = txn.transaction_date
        if hasattr(txn_date, "date"):
            txn_date = txn_date.date()
        key = (txn_date, abs(txn.amount))
        lookup[key].append(txn)

    for parsed in transactions:
        parsed_date = parsed.transaction_date
        if hasattr(parsed_date, "date"):
            parsed_date = parsed_date.date()
        key = (parsed_date, abs(parsed.amount))
        if key in lookup:
            for existing_txn in lookup[key]:
                existing_name = (existing_txn.vendor_name or "")[:10].lower()
                parsed_name = (parsed.vendor_name or "")[:10].lower()
                if existing_name == parsed_name:
                    parsed.is_duplicate = True
                    parsed.duplicate_transaction_id = existing_txn.id
                    break

    return transactions

# Rows to skip during parsing (non-transaction content)
SKIP_PATTERNS = [
    "opening balance",
    "closing total",
    "closing balance",
    "subtotal",
    "total for card",
    "total for",
    "number of items",
    "page ",
    "purchases",
    "cash advances",
    "balance transfers",
    "fees and interest",
    "payments and credits",
    "new charges",
    "previous balance",
    "new balance",
    "credit limit",
    "available credit",
    "minimum payment",
    "payment due",
    "amount enclosed",
]


def _clean_amount(value: str) -> tuple[Decimal, bool]:
    """
    Clean a raw amount string and return (amount, is_credit).

    Handles:
    - Dollar signs and commas: "$1,234.56" -> 1234.56
    - CR suffix: "89.86 CR" -> (89.86, True)
    - Parentheses for negatives: "(50.00)" -> (50.00, False) treated as debit
    - Whitespace
    """
    if not value or not value.strip():
        raise ValueError("Empty amount")

    raw = value.strip()
    is_credit = False

    # Check for CR suffix (credit card format)
    if raw.upper().endswith("CR"):
        is_credit = True
        raw = raw[:-2].strip()

    # Remove dollar sign and commas
    raw = raw.replace("$", "").replace(",", "").strip()

    # Handle parentheses for negatives
    if raw.startswith("(") and raw.endswith(")"):
        raw = raw[1:-1].strip()
        # Parenthesized amounts are debits (negative)

    if not raw:
        raise ValueError("Empty amount after cleaning")

    return Decimal(raw), is_credit


def _parse_date(value: str, year_hint: int | None = None) -> date:
    """
    Parse various date formats from bank statements.

    Handles:
    - "Jan. 28" / "Jan 28" / "Dec. 29" (BMO credit card - needs year_hint)
    - "Jan 08" (BMO bank account - needs year_hint)
    - "01/28/2026" / "2026-01-28" / "28/01/2026"
    - "January 28, 2026"
    """
    raw = value.strip().rstrip(".")

    # Try full date formats first
    full_formats = [
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%d/%m/%Y",
        "%B %d, %Y",
        "%b %d, %Y",
        "%m-%d-%Y",
    ]
    for fmt in full_formats:
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue

    # Try short formats (month + day only, need year_hint)
    # Clean periods from abbreviated months: "Jan." -> "Jan"
    cleaned = re.sub(r"(\w{3})\.", r"\1", raw)
    year = year_hint or datetime.now().year
    short_formats = ["%b %d %Y", "%B %d %Y"]
    for fmt in short_formats:
        try:
            parsed = datetime.strptime(f"{cleaned} {year}", fmt)
            return parsed.date()
        except ValueError:
            continue

    raise ValueError(f"Unable to parse date: {value}")


def _find_column(columns: list[str], patterns: list[str]) -> str | None:
    """Find the first column name matching any pattern (case-insensitive)."""
    cols_lower = {c: c.lower().strip() for c in columns}
    for pattern in patterns:
        for col, col_lower in cols_lower.items():
            if pattern in col_lower:
                return col
    return None


def _should_skip_row(description: str) -> bool:
    """Check if a row is a non-transaction entry that should be skipped."""
    desc_lower = description.lower().strip()
    return any(skip in desc_lower for skip in SKIP_PATTERNS)


def _detect_year_from_filename(filename: str) -> int | None:
    """Try to extract year from filename like 'January 28, 2026.pdf'."""
    match = re.search(r"20\d{2}", filename)
    if match:
        return int(match.group())
    return None


async def parse_csv(
    file_content: bytes, filename: str
) -> ImportParseResponse:
    """
    Parse a CSV bank/credit card statement into structured transactions.

    Detects columns by name heuristics and handles:
    - Credit card format: single amount column, "CR" suffix for credits
    - Bank format: separate debit/credit columns
    """
    warnings: list[str] = []

    # Try UTF-8, fallback to latin-1
    try:
        text = file_content.decode("utf-8")
    except UnicodeDecodeError:
        text = file_content.decode("latin-1")
        warnings.append("File was not UTF-8 encoded; decoded as Latin-1.")

    # Read CSV with pandas
    try:
        df = pd.read_csv(io.StringIO(text), dtype=str, keep_default_na=False)
    except Exception as e:
        raise ValueError(f"Could not read CSV file: {e}")

    if df.empty:
        raise ValueError("CSV file contains no data rows.")

    columns = list(df.columns)

    # Detect columns
    date_col = _find_column(columns, DATE_PATTERNS)
    amount_col = _find_column(columns, AMOUNT_PATTERNS)
    debit_col = _find_column(columns, DEBIT_PATTERNS)
    credit_col = _find_column(columns, CREDIT_PATTERNS)
    desc_col = _find_column(columns, DESC_PATTERNS)
    memo_col = _find_column(columns, MEMO_PATTERNS)

    # If desc_col matched a memo-like column, swap it
    if desc_col and desc_col.lower().strip() in ("memo", "notes", "reference", "particulars"):
        if not memo_col:
            memo_col = desc_col
        desc_col = None

    if not date_col:
        raise ValueError(
            f"Could not detect a date column. Columns found: {columns}"
        )

    if not desc_col:
        # Fallback: use the second column or the one that's not date/amount
        remaining = [
            c
            for c in columns
            if c != date_col
            and c != amount_col
            and c != debit_col
            and c != credit_col
            and c != memo_col
        ]
        # Filter out balance columns
        remaining = [
            c
            for c in remaining
            if not any(bp in c.lower() for bp in BALANCE_PATTERNS)
        ]
        if remaining:
            desc_col = remaining[0]
            warnings.append(
                f"Could not detect description column; using '{desc_col}'."
            )

    has_debit_credit = debit_col is not None or credit_col is not None
    has_single_amount = amount_col is not None and not has_debit_credit

    if not has_single_amount and not has_debit_credit:
        raise ValueError(
            f"Could not detect amount columns. Columns found: {columns}"
        )

    year_hint = _detect_year_from_filename(filename) or datetime.now().year

    transactions: list[ParsedTransaction] = []
    row_index = 0

    for _, row in df.iterrows():
        # Get description and check if this is a real transaction row
        description = str(row.get(desc_col, "")).strip() if desc_col else ""

        if _should_skip_row(description):
            continue

        # Parse date
        date_str = str(row.get(date_col, "")).strip()
        if not date_str:
            continue

        try:
            txn_date = _parse_date(date_str, year_hint)
        except ValueError:
            warnings.append(f"Skipped row with unparseable date: '{date_str}'")
            continue

        # Parse amount
        try:
            if has_single_amount:
                raw_amount = str(row.get(amount_col, "")).strip()
                if not raw_amount:
                    continue
                amount, is_credit = _clean_amount(raw_amount)
                # Credit card: non-CR amounts are expenses (negative)
                # But if the value is already negative, don't double-negate
                if not is_credit and amount > 0:
                    amount = -amount
            else:
                # Separate debit/credit columns
                raw_debit = (
                    str(row.get(debit_col, "")).strip() if debit_col else ""
                )
                raw_credit = (
                    str(row.get(credit_col, "")).strip() if credit_col else ""
                )

                if raw_debit and raw_debit != "0" and raw_debit != "0.00":
                    amount, _ = _clean_amount(raw_debit)
                    amount = -amount  # Debits are negative
                elif raw_credit and raw_credit != "0" and raw_credit != "0.00":
                    amount, _ = _clean_amount(raw_credit)
                    # Credits are positive
                else:
                    continue  # No amount in either column
        except (ValueError, InvalidOperation) as e:
            warnings.append(f"Skipped row with unparseable amount: {e}")
            continue

        vendor_name = description or "Unknown"

        transactions.append(
            ParsedTransaction(
                row_index=row_index,
                transaction_date=txn_date,
                vendor_name=vendor_name,
                amount=amount,
                description=description if description != vendor_name else None,
            )
        )
        row_index += 1

    if not transactions:
        raise ValueError(
            "No transactions could be extracted from the CSV file. "
            "Check that the file contains transaction data with recognizable column headers."
        )

    return ImportParseResponse(
        file_type=ImportFileType.CSV,
        file_name=filename,
        transactions=transactions,
        total_count=len(transactions),
        parse_warnings=warnings,
    )


# --- PDF Parsing (Mistral Document AI OCR) ---


async def _call_mistral_ocr(
    pdf_bytes: bytes,
    api_key: str,
    ocr_url: str,
    model: str,
) -> dict:
    """
    Call Mistral Document AI OCR API to extract text from PDF.

    Returns the raw JSON response from the API.
    """
    b64_pdf = base64.b64encode(pdf_bytes).decode("utf-8")
    data_uri = f"data:application/pdf;base64,{b64_pdf}"

    payload = {
        "model": model,
        "document": {
            "type": "document_url",
            "document_url": data_uri,
        },
        "include_image_base64": False,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            ocr_url,
            json=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )
        response.raise_for_status()

    return response.json()


def _extract_transactions_from_ocr_text(
    ocr_text: str, filename: str
) -> tuple[list[ParsedTransaction], str | None, str | None, list[str]]:
    """
    Parse OCR text output to extract structured transaction data.

    Handles two statement formats:
    1. Credit card: TRANS DATE | POSTING DATE | DESCRIPTION | AMOUNT ($)
       - "CR" suffix indicates credit/payment
    2. Bank account: Date | Description | Debited ($) | Credited ($) | Balance ($)

    Returns: (transactions, statement_period, account_info, warnings)
    """
    warnings: list[str] = []
    transactions: list[ParsedTransaction] = []

    # Detect statement type
    text_lower = ocr_text.lower()
    is_credit_card = any(
        kw in text_lower
        for kw in ["mastercard", "visa", "credit card", "cashback"]
    )
    is_bank = any(
        kw in text_lower
        for kw in ["business banking", "chequing", "savings account"]
    )

    # Extract metadata
    statement_period = None
    account_info = None

    # Statement period patterns
    period_match = re.search(
        r"(?:statement\s+period|for\s+the\s+period)[:\s]*(.+?)(?:\n|$)",
        ocr_text,
        re.IGNORECASE,
    )
    if period_match:
        statement_period = period_match.group(1).strip()

    period_ending_match = re.search(
        r"period\s+ending\s+(\w+\s+\d{1,2},?\s*\d{4})",
        ocr_text,
        re.IGNORECASE,
    )
    if period_ending_match and not statement_period:
        statement_period = f"Ending {period_ending_match.group(1).strip()}"

    # Account info
    if is_credit_card:
        card_match = re.search(
            r"(BMO[^\n]*(?:MasterCard|Visa)[^\n]*)", ocr_text, re.IGNORECASE
        )
        if card_match:
            account_info = card_match.group(1).strip()
    elif is_bank:
        bank_match = re.search(
            r"(Business\s+(?:Banking|Account)[^\n]*)",
            ocr_text,
            re.IGNORECASE,
        )
        if bank_match:
            account_info = bank_match.group(1).strip()

    year_hint = _detect_year_from_filename(filename) or datetime.now().year

    # --- Try HTML table extraction first (Mistral OCR often returns HTML tables) ---
    html_rows = re.findall(r"<tr>(.*?)</tr>", ocr_text, re.DOTALL)
    if html_rows:
        row_index = 0
        for html_row in html_rows:
            # Skip header rows (<th> tags)
            if "<th>" in html_row or "<th " in html_row:
                continue

            cells = re.findall(r"<td[^>]*>(.*?)</td>", html_row, re.DOTALL)
            if len(cells) < 3:
                continue

            # Clean HTML entities and whitespace from cells
            cells = [
                c.replace("&amp;", "&").replace("&lt;", "<")
                .replace("&gt;", ">").replace("&nbsp;", " ").strip()
                for c in cells
            ]

            if _should_skip_row(" ".join(cells)):
                continue

            # Try to parse based on statement type
            parsed = None

            if is_credit_card and len(cells) >= 3:
                # Credit card formats from OCR:
                # 4 cells: TRANS DATE | POSTING DATE | DESCRIPTION | AMOUNT
                # 3 cells: "TRANS DATE POSTING DATE" | DESCRIPTION | AMOUNT
                #   (OCR sometimes merges both dates into one cell)
                # Also: first cell may contain two dates like "Dec. 26 Dec. 29"

                # Extract transaction date from first cell
                first_cell = cells[0]
                amount_str = cells[-1]

                # Try to extract a date from a cell that may have two dates
                # e.g. "Dec. 26 Dec. 29" → extract "Dec. 26"
                date_match = re.match(
                    r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
                    r"\.?\s+\d{1,2})",
                    first_cell,
                    re.IGNORECASE,
                )
                trans_date_str = date_match.group(1) if date_match else first_cell

                # Description is everything between first cell and amount
                if len(cells) == 3:
                    description = cells[1]
                elif len(cells) == 4:
                    description = cells[2]
                else:
                    description = " ".join(cells[1:-1])

                try:
                    txn_date = _parse_date(trans_date_str, year_hint)
                    amount, is_cr = _clean_amount(amount_str)
                    if not is_cr and amount > 0:
                        amount = -amount

                    parsed = ParsedTransaction(
                        row_index=row_index,
                        transaction_date=txn_date,
                        vendor_name=description.strip(),
                        amount=amount,
                    )
                except (ValueError, InvalidOperation) as e:
                    warnings.append(f"Skipped HTML row (credit card): {e}")

            elif is_bank and len(cells) >= 4:
                # Bank: Date | Description | Debited | Credited | Balance
                date_str = cells[0]
                description = cells[1]
                debit_str = cells[2] if len(cells) >= 5 else ""
                credit_str = cells[3] if len(cells) >= 5 else ""

                try:
                    txn_date = _parse_date(date_str, year_hint)
                    if debit_str and debit_str not in ("", "0", "0.00"):
                        amount, _ = _clean_amount(debit_str)
                        amount = -amount
                    elif credit_str and credit_str not in ("", "0", "0.00"):
                        amount, _ = _clean_amount(credit_str)
                    else:
                        continue
                    parsed = ParsedTransaction(
                        row_index=row_index,
                        transaction_date=txn_date,
                        vendor_name=description.strip(),
                        amount=amount,
                    )
                except (ValueError, InvalidOperation) as e:
                    warnings.append(f"Skipped HTML row (bank): {e}")

            else:
                # Generic: try first cell as date, last cell as amount
                try:
                    txn_date = _parse_date(cells[0], year_hint)
                    amount, is_cr = _clean_amount(cells[-1])
                    description = " ".join(cells[1:-1]).strip() or "Unknown"
                    if not is_cr and is_credit_card and amount > 0:
                        amount = -amount
                    parsed = ParsedTransaction(
                        row_index=row_index,
                        transaction_date=txn_date,
                        vendor_name=description,
                        amount=amount,
                    )
                except (ValueError, InvalidOperation):
                    pass

            if parsed:
                transactions.append(parsed)
                row_index += 1

        if transactions:
            _fix_year_spanning_dates(transactions)
            return transactions, statement_period, account_info, warnings

    # --- Fallback: line-by-line parsing for non-HTML OCR output ---

    # Split into lines and look for transaction-like rows
    lines = ocr_text.split("\n")

    # Strategy: look for lines that start with a date pattern
    # Credit card: "Dec. 26 Dec. 29 LinkedIn Pre P10151117 Mountain ViewCA 149.32"
    # Bank: "Jan 08 Online Transfer, TF 2736#8921-633 250.00 273.23"

    # Credit card pattern: two dates, description, amount (optional CR)
    cc_pattern = re.compile(
        r"^(?:\|?\s*)"
        r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2})"
        r"\s+"
        r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2})"
        r"\s+"
        r"(.+?)\s+"
        r"([\d,]+\.\d{2}(?:\s*CR)?)"
        r"\s*\|?\s*$",
        re.IGNORECASE,
    )

    # Bank pattern: date, description, debit and/or credit, balance
    # "Jan 08 Online Transfer, TF 2736#8921-633 250.00 273.23"
    bank_pattern = re.compile(
        r"^(?:\|?\s*)"
        r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2})"
        r"\s+"
        r"(.+?)\s{2,}"
        r"([\d,]+\.\d{2})?"
        r"\s+"
        r"([\d,]+\.\d{2})?"
        r"\s+"
        r"([\d,]+\.\d{2})"
        r"\s*\|?\s*$",
        re.IGNORECASE,
    )

    # Also handle markdown table format (pipe-separated)
    pipe_pattern = re.compile(
        r"\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|",
    )

    row_index = 0

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Skip non-transaction lines
        if _should_skip_row(line):
            continue

        parsed = None

        if is_credit_card:
            match = cc_pattern.match(line)
            if match:
                trans_date_str = match.group(1)
                description = match.group(3).strip()
                amount_str = match.group(4).strip()

                try:
                    txn_date = _parse_date(trans_date_str, year_hint)
                    amount, is_credit = _clean_amount(amount_str)
                    if not is_credit:
                        amount = -amount

                    parsed = ParsedTransaction(
                        row_index=row_index,
                        transaction_date=txn_date,
                        vendor_name=description,
                        amount=amount,
                    )
                except (ValueError, InvalidOperation) as e:
                    warnings.append(
                        f"Skipped line (credit card parse error): {e}"
                    )

        if not parsed and is_bank:
            match = bank_pattern.match(line)
            if match:
                date_str = match.group(1)
                description = match.group(2).strip()
                debit_str = match.group(3)
                credit_str = match.group(4)

                try:
                    txn_date = _parse_date(date_str, year_hint)

                    if debit_str:
                        amount, _ = _clean_amount(debit_str)
                        amount = -amount
                    elif credit_str:
                        amount, _ = _clean_amount(credit_str)
                    else:
                        continue

                    parsed = ParsedTransaction(
                        row_index=row_index,
                        transaction_date=txn_date,
                        vendor_name=description,
                        amount=amount,
                    )
                except (ValueError, InvalidOperation) as e:
                    warnings.append(
                        f"Skipped line (bank parse error): {e}"
                    )

        # Fallback: try pipe-separated markdown table
        if not parsed:
            match = pipe_pattern.search(line)
            if match:
                cells = [c.strip() for c in line.split("|") if c.strip()]
                if len(cells) >= 3:
                    # Try to identify which cell is a date
                    for i, cell in enumerate(cells):
                        try:
                            txn_date = _parse_date(cell, year_hint)
                            # Found a date, look for amount in remaining cells
                            remaining = [
                                c
                                for j, c in enumerate(cells)
                                if j != i
                            ]
                            # Last numeric-looking cell is likely amount
                            for r_cell in reversed(remaining):
                                try:
                                    amount, is_credit = _clean_amount(r_cell)
                                    # Description: first non-date, non-amount cell
                                    desc_cells = [
                                        c
                                        for c in remaining
                                        if c != r_cell
                                    ]
                                    description = (
                                        " ".join(desc_cells).strip()
                                        or "Unknown"
                                    )

                                    if not is_credit and is_credit_card:
                                        amount = -amount

                                    parsed = ParsedTransaction(
                                        row_index=row_index,
                                        transaction_date=txn_date,
                                        vendor_name=description,
                                        amount=amount,
                                    )
                                    break
                                except (ValueError, InvalidOperation):
                                    continue
                            break
                        except ValueError:
                            continue

        if parsed:
            transactions.append(parsed)
            row_index += 1

    _fix_year_spanning_dates(transactions)

    return transactions, statement_period, account_info, warnings


async def parse_pdf(
    file_content: bytes,
    filename: str,
    azure_api_key: str,
    azure_ocr_url: str,
    azure_ocr_model: str,
) -> ImportParseResponse:
    """
    Parse a PDF bank/credit card statement using Mistral Document AI OCR.

    Stage 1: Call OCR API to extract text
    Stage 2: Deterministic parsing to extract transactions
    """
    warnings: list[str] = []

    # Stage 1: OCR
    try:
        ocr_response = await _call_mistral_ocr(
            file_content, azure_api_key, azure_ocr_url, azure_ocr_model
        )
    except httpx.TimeoutException:
        raise ValueError(
            "OCR service timed out. The PDF may be too large. Please try again."
        )
    except httpx.HTTPStatusError as e:
        raise ValueError(
            f"OCR service returned an error (HTTP {e.response.status_code}). "
            "Please try again."
        )

    ocr_text = extract_ocr_text(ocr_response)

    # Log OCR output for debugging
    logger.debug("OCR extracted %d chars from %s", len(ocr_text), filename)

    # Stage 2: Parse transactions from OCR text
    transactions, statement_period, account_info, parse_warnings = (
        _extract_transactions_from_ocr_text(ocr_text, filename)
    )
    warnings.extend(parse_warnings)

    if not transactions:
        warnings.append(
            "No transactions could be automatically extracted. "
            "The statement format may not be supported yet."
        )

    return ImportParseResponse(
        file_type=ImportFileType.PDF,
        file_name=filename,
        statement_period=statement_period,
        account_info=account_info,
        transactions=transactions,
        total_count=len(transactions),
        parse_warnings=warnings,
    )


# --- Deduplication ---


async def check_duplicates(
    transactions: list[ParsedTransaction],
    business_id: int,
    db: AsyncSession,
) -> list[ParsedTransaction]:
    """Check parsed transactions against existing DB records for duplicates."""
    if not transactions:
        return transactions

    min_date = min(t.transaction_date for t in transactions)
    max_date = max(t.transaction_date for t in transactions)

    stmt = select(Transaction).where(
        and_(
            Transaction.business_id == business_id,
            Transaction.transaction_date >= min_date,
            Transaction.transaction_date <= max_date,
        )
    )
    result = await db.execute(stmt)
    existing = result.scalars().all()

    return _mark_duplicates(transactions, existing)


# --- Synchronous variants for Celery workers ---
# Celery tasks run in a sync context, so we need non-async versions
# of functions that do I/O (OCR API calls, DB queries).


def _call_mistral_ocr_sync(
    pdf_bytes: bytes,
    api_key: str,
    ocr_url: str,
    model: str,
) -> dict:
    """
    Synchronous version of _call_mistral_ocr for Celery workers.

    Uses httpx synchronous client instead of async.
    """
    b64_pdf = base64.b64encode(pdf_bytes).decode("utf-8")
    data_uri = f"data:application/pdf;base64,{b64_pdf}"

    payload = {
        "model": model,
        "document": {
            "type": "document_url",
            "document_url": data_uri,
        },
        "include_image_base64": False,
    }

    with httpx.Client(timeout=120.0) as client:
        response = client.post(
            ocr_url,
            json=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )
        response.raise_for_status()

    return response.json()


def check_duplicates_sync(
    transactions: list[ParsedTransaction],
    business_id: int,
    db: SyncSession,
) -> list[ParsedTransaction]:
    """Synchronous version of check_duplicates for Celery workers."""
    if not transactions:
        return transactions

    min_date = min(t.transaction_date for t in transactions)
    max_date = max(t.transaction_date for t in transactions)

    stmt = select(Transaction).where(
        and_(
            Transaction.business_id == business_id,
            Transaction.transaction_date >= min_date,
            Transaction.transaction_date <= max_date,
        )
    )
    result = db.execute(stmt)
    existing = result.scalars().all()

    return _mark_duplicates(transactions, existing)
