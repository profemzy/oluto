"""
AsyncJob model for tracking background task state.

Stores job metadata in PostgreSQL for reliable status tracking,
independent of the Celery result backend (Redis).

This ensures job history survives Redis restarts and provides
queryable audit trail of all background operations.
"""

from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, func, Integer, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import Business


class AsyncJob(Base):
    """
    Background task tracker.

    Status flow: pending → running → completed | failed
    """

    __tablename__ = "async_jobs"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Celery task ID (UUID string from Celery)
    celery_task_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # Job type (e.g., "pdf_import", "csv_import", "ai_categorize")
    job_type: Mapped[str] = mapped_column(String(50), index=True)

    # Status: pending, running, completed, failed
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)

    # Progress tracking (0-100)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    progress_message: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Result data (JSON) — stores the parsed result on completion
    result_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Error info on failure
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_type: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Retry tracking
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    max_retries: Mapped[int] = mapped_column(Integer, default=3)

    # Input metadata (what was submitted — for audit + retry)
    input_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    input_file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Tenancy
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"))
    business: Mapped["Business"] = relationship()
    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
