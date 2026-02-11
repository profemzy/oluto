from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import String, ForeignKey, DateTime, func, Numeric, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import Business


class Transaction(Base):
    """
    The Single Source of Truth for Financial Events.
    State Machine: DRAFT -> PROCESSING -> INBOX -> READY -> POSTED
    """

    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Financial Core
    vendor_name: Mapped[str] = mapped_column(String(255))
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(3), default="CAD")
    transaction_date: Mapped[date] = mapped_column(DateTime(timezone=True))
    category: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # State Machine
    status: Mapped[str] = mapped_column(String(50), default="draft", index=True)
    # draft, processing, inbox_user, inbox_firm, ready, posted

    # AI Metadata
    ai_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    ai_suggested_category: Mapped[str] = mapped_column(String(100), nullable=True)

    # Tax Metadata (The Oluto Special Sauce)
    gst_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    pst_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))

    # Import Tracking
    import_source: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # Values: "manual", "csv_import", "pdf_import"
    import_batch_id: Mapped[str | None] = mapped_column(
        String(36), nullable=True, index=True
    )
    # UUID grouping all transactions from a single import

    # Tenancy
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"))
    business: Mapped["Business"] = relationship(back_populates="transactions")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )
