from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from decimal import Decimal
from enum import Enum
from datetime import date, datetime


class SourceDevice(str, Enum):
    MOBILE = "mobile"
    WEB = "web"
    VOICE = "voice"


class TaxFlags(BaseModel):
    gst_likely: bool
    pst_likely: bool
    itc_eligible: bool
    deductibility_pct: int = Field(100, ge=0, le=100)


class TransactionCategory(BaseModel):
    category_cra: str  # e.g., "Meals & Entertainment"
    confidence_score: float
    tax_flags: TaxFlags
    user_question: Optional[str] = None


class TransactionBase(BaseModel):
    vendor_name: str
    amount: Decimal
    currency: str = "CAD"
    description: Optional[str] = None
    transaction_date: date
    category: Optional[str] = None


class TransactionCreate(TransactionBase):
    source_device: SourceDevice = SourceDevice.WEB
    tax_flags: Optional[TaxFlags] = None
    ai_suggested_category: Optional[str] = None
    ai_confidence: float = 0.0


class TransactionUpdate(BaseModel):
    vendor_name: Optional[str] = None
    amount: Optional[Decimal] = None
    currency: Optional[str] = None
    description: Optional[str] = None
    transaction_date: Optional[date] = None
    category: Optional[str] = None
    status: Optional[str] = None


class TransactionRead(TransactionBase):
    id: int
    status: str
    gst_amount: Decimal
    pst_amount: Decimal
    ai_confidence: float
    ai_suggested_category: Optional[str] = None
    business_id: int
    import_source: Optional[str] = None
    import_batch_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("transaction_date", mode="before")
    @classmethod
    def coerce_datetime_to_date(cls, v: object) -> date:
        """DB returns timezone-aware datetime; coerce to plain date."""
        if isinstance(v, datetime):
            return v.date()
        return v  # type: ignore[return-value]


class StatusCounts(BaseModel):
    draft: int = 0
    processing: int = 0
    inbox_user: int = 0
    inbox_firm: int = 0
    ready: int = 0
    posted: int = 0


class DashboardSummary(BaseModel):
    total_revenue: Decimal
    total_expenses: Decimal
    tax_reserved: Decimal
    safe_to_spend: Decimal
    exceptions_count: int
    transactions_count: int
    status_counts: StatusCounts
    recent_transactions: list[TransactionRead]
    exceptions: list[TransactionRead]


# --- Import Schemas ---


class ImportFileType(str, Enum):
    CSV = "csv"
    PDF = "pdf"


class ParsedTransaction(BaseModel):
    """A single transaction extracted from an import file (not yet saved)."""

    row_index: int
    transaction_date: date
    vendor_name: str
    amount: Decimal  # Negative = expense, positive = income
    description: Optional[str] = None
    category: Optional[str] = None
    ai_confidence: float = 0.0
    is_duplicate: bool = False
    duplicate_transaction_id: Optional[int] = None


class ImportParseResponse(BaseModel):
    """Response from the parse endpoint."""

    file_type: ImportFileType
    file_name: str
    statement_period: Optional[str] = None
    account_info: Optional[str] = None
    transactions: list[ParsedTransaction]
    total_count: int
    duplicate_count: int = 0
    parse_warnings: list[str] = []


class ImportTransactionItem(BaseModel):
    """A single transaction submitted for confirmation (user-reviewed)."""

    transaction_date: date
    vendor_name: str
    amount: Decimal
    description: Optional[str] = None
    category: Optional[str] = None
    ai_suggested_category: Optional[str] = None
    ai_confidence: float = 0.0


class ImportConfirmRequest(BaseModel):
    """Request body for the confirm endpoint."""

    file_type: ImportFileType
    transactions: list[ImportTransactionItem]


class ImportConfirmResponse(BaseModel):
    """Response from the confirm endpoint."""

    imported_count: int
    batch_id: str
    transactions: list[TransactionRead]


# --- Bulk Status Update Schemas ---


VALID_STATUSES = {"draft", "processing", "inbox_user", "inbox_firm", "ready", "posted"}


# --- Category Suggestion Schemas ---


class CategorySuggestRequest(BaseModel):
    """Request body for AI category suggestion."""

    vendor_name: str
    amount: Optional[Decimal] = None
    description: Optional[str] = None


class CategorySuggestResponse(BaseModel):
    """Response from AI category suggestion."""

    category: str
    confidence: float
    reasoning: Optional[str] = None


# --- Bulk Status Update Schemas ---


class BulkStatusUpdateRequest(BaseModel):
    """Bulk-update status for multiple transactions."""

    transaction_ids: Optional[list[int]] = None
    batch_id: Optional[str] = None
    status: str

    def model_post_init(self, __context: object) -> None:
        if not self.transaction_ids and not self.batch_id:
            raise ValueError("Must provide either transaction_ids or batch_id")
        if self.status not in VALID_STATUSES:
            raise ValueError(
                f"Invalid status '{self.status}'. Must be one of: {', '.join(sorted(VALID_STATUSES))}"
            )


class BulkStatusUpdateResponse(BaseModel):
    """Response from bulk status update."""

    updated_count: int
    transactions: list[TransactionRead]
