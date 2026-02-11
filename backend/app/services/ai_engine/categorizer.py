"""
AI-powered transaction categorization using Fuelix (OpenAI-compatible).

Provides both batch categorization (for CSV/PDF imports) and single-transaction
suggestions (for real-time category hints while creating transactions).

The categorizer owns its own config — callers just pass business data
(vendor name, transactions). No caller needs to know about API keys.

All functions degrade gracefully — AI errors never break the import or create flow.
"""

import json
import logging
import re
from dataclasses import dataclass
from decimal import Decimal

from openai import AsyncOpenAI, OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


def _strip_code_fences(text: str) -> str:
    """Strip markdown code fences (```json ... ```) that some models wrap JSON in."""
    stripped = re.sub(r"^```(?:json)?\s*\n?", "", text.strip())
    stripped = re.sub(r"\n?```\s*$", "", stripped)
    return stripped.strip()


# Canonical CRA T2125 expense categories — must match frontend lists
CRA_CATEGORIES = [
    "Advertising",
    "Bad debts",
    "Business tax, fees, licences, dues, memberships",
    "Delivery, freight, and express",
    "Fuel costs",
    "Insurance",
    "Interest and bank charges",
    "Legal, accounting, and professional fees",
    "Management and administration fees",
    "Meals and entertainment",
    "Motor vehicle expenses",
    "Office expenses",
    "Prepaid expenses",
    "Property taxes",
    "Rent",
    "Repairs and maintenance",
    "Salaries, wages, and benefits",
    "Supplies",
    "Telephone and utilities",
    "Travel",
    "Other expenses",
]

# Case-insensitive lookup for validation
_CRA_LOOKUP: dict[str, str] = {c.lower(): c for c in CRA_CATEGORIES}

MAX_BATCH_SIZE = 50


# ---------------------------------------------------------------------------
# Config ownership — categorizer reads settings itself
# ---------------------------------------------------------------------------


def is_ai_configured() -> bool:
    """Check if AI categorization is available."""
    return bool(settings.FUELIX_API_KEY)


def _get_async_client() -> AsyncOpenAI:
    """Async client for FastAPI endpoints."""
    return AsyncOpenAI(api_key=settings.FUELIX_API_KEY, base_url=settings.FUELIX_BASE_URL)


def _get_sync_client() -> OpenAI:
    """Sync client for Celery tasks."""
    return OpenAI(api_key=settings.FUELIX_API_KEY, base_url=settings.FUELIX_BASE_URL)


# ---------------------------------------------------------------------------
# Unified system prompt — built from CRA_CATEGORIES, not duplicated strings
# ---------------------------------------------------------------------------

_CATEGORIES_BLOCK = "\n".join(f"- {c}" for c in CRA_CATEGORIES)


def _build_system_prompt(*, batch: bool) -> str:
    base = (
        "You are a Canadian small business bookkeeping assistant.\n"
        f"Classify {'each transaction' if batch else 'the transaction'} "
        "into exactly ONE CRA T2125 expense category.\n\n"
        f"Categories:\n{_CATEGORIES_BLOCK}\n\n"
        "Use ALL available context to classify accurately:\n"
        "- vendor_name: the merchant or payee (may include location, merchant codes)\n"
        "- description: additional transaction details from the bank statement\n"
        "- amount: the transaction amount\n"
        "Analyze merchant names, locations, and descriptions together for best accuracy.\n\n"
    )
    if batch:
        base += (
            "For each transaction, respond with its index, the exact category name "
            "from the list above, and a confidence score from 0.0 to 1.0.\n\n"
            'Respond with JSON only: {"results": [{"index": 0, "category": "...", "confidence": 0.95}, ...]}'
        )
    else:
        base += (
            'Respond with JSON only: {"category": "<exact category name>", '
            '"confidence": <0.0-1.0>, "reasoning": "<one sentence>"}'
        )
    return base


# ---------------------------------------------------------------------------
# Shared LLM call helpers — one place for API call + code-fence stripping
# ---------------------------------------------------------------------------


async def _call_llm_async(system_prompt: str, user_content: str, **kwargs) -> str:
    """Make an async LLM call and return the raw JSON string."""
    client = _get_async_client()
    response = await client.chat.completions.create(
        model=settings.FUELIX_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=0.1,
        **kwargs,
    )
    return _strip_code_fences(response.choices[0].message.content or "{}")


def _call_llm_sync(system_prompt: str, user_content: str, **kwargs) -> str:
    """Make a sync LLM call and return the raw JSON string."""
    client = _get_sync_client()
    response = client.chat.completions.create(
        model=settings.FUELIX_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=0.1,
        **kwargs,
    )
    return _strip_code_fences(response.choices[0].message.content or "{}")


# ---------------------------------------------------------------------------
# Pure helpers (unchanged)
# ---------------------------------------------------------------------------


def _validate_category(category: str) -> str:
    """Return the canonical CRA category name, or 'Other expenses' if invalid."""
    canonical = _CRA_LOOKUP.get(category.lower().strip())
    return canonical if canonical else "Other expenses"


def _clamp_confidence(value: object) -> float:
    """Clamp a confidence value to [0.0, 1.0]."""
    try:
        f = float(value)  # type: ignore[arg-type]
        return max(0.0, min(1.0, f))
    except (TypeError, ValueError):
        return 0.0


def _build_batch_input(transactions: list) -> str:
    """Build the user message listing transactions for batch categorization."""
    items = []
    for i, txn in enumerate(transactions):
        entry: dict[str, object] = {
            "index": i,
            "vendor_name": txn.vendor_name,
            "amount": str(txn.amount),
        }
        if txn.description:
            entry["description"] = txn.description
        items.append(entry)
    return json.dumps(items)


def _parse_categorization_response(raw: str) -> list[dict]:
    """
    Parse the LLM JSON response into a list of category assignments.

    Handles both `{"results": [...]}` and direct `[...]` formats.
    """
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("AI categorization returned invalid JSON")
        return []

    if isinstance(data, list):
        return data
    if isinstance(data, dict) and "results" in data:
        return data["results"]
    return []


def _apply_categories(
    transactions: list,
    assignments: list[dict],
) -> list:
    """Apply AI category assignments back to the ParsedTransaction list."""
    for entry in assignments:
        idx = entry.get("index")
        if not isinstance(idx, int) or idx < 0 or idx >= len(transactions):
            continue

        category = _validate_category(entry.get("category", ""))
        confidence = _clamp_confidence(entry.get("confidence", 0.0))

        transactions[idx].category = category
        transactions[idx].ai_confidence = confidence

    return transactions


# ---------------------------------------------------------------------------
# Single-transaction suggestion
# ---------------------------------------------------------------------------


@dataclass
class CategorySuggestion:
    category: str
    confidence: float
    reasoning: str | None


# In-memory cache: "vendor|description" -> CategorySuggestion
_suggestion_cache: dict[str, CategorySuggestion] = {}
_CACHE_MAX_SIZE = 500


async def suggest_category_async(
    vendor_name: str,
    amount: Decimal | None = None,
    description: str | None = None,
) -> CategorySuggestion:
    """
    Suggest a CRA expense category for a single transaction.

    Uses an in-memory cache keyed on normalized vendor name + description
    to avoid redundant API calls while allowing refined suggestions when
    description context is provided.
    """
    desc_part = (description or "").strip().lower()
    cache_key = f"{vendor_name.strip().lower()}|{desc_part}"

    if cache_key in _suggestion_cache:
        return _suggestion_cache[cache_key]

    context_parts = [f"Vendor: {vendor_name}"]
    if amount is not None:
        context_parts.append(f"Amount: ${amount}")
    if description:
        context_parts.append(f"Description: {description}")
    user_content = "\n".join(context_parts)

    try:
        raw = await _call_llm_async(
            _build_system_prompt(batch=False),
            user_content,
            max_tokens=150,
        )
        result = json.loads(raw)

        category = _validate_category(result.get("category", ""))
        confidence = _clamp_confidence(result.get("confidence", 0.5))
        reasoning = result.get("reasoning")

        suggestion = CategorySuggestion(
            category=category,
            confidence=confidence,
            reasoning=reasoning,
        )
    except Exception as exc:
        logger.warning("AI category suggestion failed: %s", exc)
        suggestion = CategorySuggestion(
            category="Other expenses",
            confidence=0.0,
            reasoning=None,
        )

    # Cache the result
    if len(_suggestion_cache) >= _CACHE_MAX_SIZE:
        oldest_key = next(iter(_suggestion_cache))
        del _suggestion_cache[oldest_key]
    _suggestion_cache[cache_key] = suggestion

    return suggestion


# ---------------------------------------------------------------------------
# Batch categorization (for CSV/PDF imports)
# ---------------------------------------------------------------------------


def _process_batch_response(transactions: list, raw: str, start: int) -> None:
    """Parse LLM response, adjust indices for chunk offset, apply categories."""
    assignments = _parse_categorization_response(raw)
    for a in assignments:
        if isinstance(a.get("index"), int):
            a["index"] += start
    _apply_categories(transactions, assignments)


async def categorize_transactions_async(transactions: list) -> list:
    """
    Batch-categorize transactions using LLM (async, for FastAPI/CSV flow).

    Chunks large lists into batches of MAX_BATCH_SIZE. Errors are logged and
    the original transactions are returned uncategorized.
    """
    if not transactions:
        return transactions

    try:
        system_prompt = _build_system_prompt(batch=True)

        for start in range(0, len(transactions), MAX_BATCH_SIZE):
            batch = transactions[start : start + MAX_BATCH_SIZE]
            user_content = _build_batch_input(batch)
            raw = await _call_llm_async(system_prompt, user_content)
            _process_batch_response(transactions, raw, start)

    except Exception as exc:
        logger.warning("AI batch categorization failed: %s", exc)

    return transactions


def categorize_transactions_sync(transactions: list) -> list:
    """
    Batch-categorize transactions using LLM (sync, for Celery/PDF task).

    Same logic as the async version but uses the synchronous client.
    """
    if not transactions:
        return transactions

    try:
        system_prompt = _build_system_prompt(batch=True)

        for start in range(0, len(transactions), MAX_BATCH_SIZE):
            batch = transactions[start : start + MAX_BATCH_SIZE]
            user_content = _build_batch_input(batch)
            raw = _call_llm_sync(system_prompt, user_content)
            _process_batch_response(transactions, raw, start)

    except Exception as exc:
        logger.warning("AI batch categorization (sync) failed: %s", exc)

    return transactions
