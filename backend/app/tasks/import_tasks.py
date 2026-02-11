"""
Celery tasks for statement import processing.

PDF imports are long-running (OCR API calls can take 30-120s),
so they run as background tasks with progress tracking.

CSV imports remain synchronous (fast enough for inline processing).
"""

import base64
import logging
from datetime import datetime, timezone

from celery import Task
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.celery_app import celery_app
from app.core.config import settings
from app.models.async_job import AsyncJob

logger = logging.getLogger(__name__)


def _get_sync_session() -> Session:
    """
    Create a synchronous DB session for use in Celery workers.

    Celery tasks run in a sync context (not async), so we use
    a standard SQLAlchemy engine instead of the async one.
    """
    sync_url = settings.DATABASE_URL.replace(
        "postgresql+asyncpg", "postgresql+psycopg2"
    ).replace("?ssl=require", "?sslmode=require")
    engine = create_engine(sync_url, pool_pre_ping=True)
    session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    return session_factory()


def _update_job(
    db: Session,
    job_id: int,
    *,
    status: str | None = None,
    progress: int | None = None,
    progress_message: str | None = None,
    result_data: dict | None = None,
    error_message: str | None = None,
    error_type: str | None = None,
    started_at: datetime | None = None,
    completed_at: datetime | None = None,
    retry_count: int | None = None,
) -> None:
    """Update an AsyncJob record with new state."""
    job = db.get(AsyncJob, job_id)
    if not job:
        logger.warning("AsyncJob %d not found for update", job_id)
        return

    if status is not None:
        job.status = status
    if progress is not None:
        job.progress = progress
    if progress_message is not None:
        job.progress_message = progress_message
    if result_data is not None:
        job.result_data = result_data
    if error_message is not None:
        job.error_message = error_message
    if error_type is not None:
        job.error_type = error_type
    if started_at is not None:
        job.started_at = started_at
    if completed_at is not None:
        job.completed_at = completed_at
    if retry_count is not None:
        job.retry_count = retry_count

    db.commit()


class ImportTaskBase(Task):
    """Base class for import tasks with common error handling."""

    autoretry_for = (ConnectionError, TimeoutError)
    retry_backoff = True  # Exponential backoff
    retry_backoff_max = 300  # Max 5 minutes between retries
    retry_jitter = True  # Random jitter to avoid thundering herd


@celery_app.task(
    base=ImportTaskBase,
    bind=True,
    name="app.tasks.import_tasks.process_pdf_import",
    max_retries=3,
    soft_time_limit=300,  # 5 minute soft limit
    time_limit=360,  # 6 minute hard limit
)
def process_pdf_import(
    self: Task,
    job_id: int,
    file_content_b64: str,
    filename: str,
    business_id: int,
) -> dict:
    """
    Process a PDF bank statement import as a background task.

    Steps:
    1. Call Mistral OCR API to extract text
    2. Parse transactions from OCR output
    3. Check for duplicates
    4. Store results in AsyncJob

    The file content is passed as base64 since Celery uses JSON serialization.
    """
    import httpx

    from app.services.import_parser import (
        _call_mistral_ocr_sync,
        _extract_transactions_from_ocr_text,
        check_duplicates_sync,
    )
    from app.services.ocr_utils import extract_ocr_text
    from app.schemas.transaction import ImportFileType

    db = _get_sync_session()

    try:
        # Mark as running
        _update_job(
            db,
            job_id,
            status="running",
            progress=5,
            progress_message="Starting PDF processing...",
            started_at=datetime.now(timezone.utc),
        )

        # Decode file content
        file_content = base64.b64decode(file_content_b64)

        # Step 1: OCR
        _update_job(
            db, job_id,
            progress=10,
            progress_message="Sending to OCR service...",
        )

        try:
            ocr_response = _call_mistral_ocr_sync(
                file_content,
                settings.AZURE_API_KEY,
                settings.AZURE_OCR_URL,
                settings.AZURE_OCR_MODEL,
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

        _update_job(
            db, job_id,
            progress=50,
            progress_message="OCR complete. Extracting transactions...",
        )

        # Step 2: Extract text from OCR response
        ocr_text = extract_ocr_text(ocr_response)
        logger.info("OCR extracted %d chars from %s", len(ocr_text), filename)

        # Step 3: Parse transactions
        _update_job(
            db, job_id,
            progress=65,
            progress_message="Parsing transactions...",
        )

        transactions, statement_period, account_info, parse_warnings = (
            _extract_transactions_from_ocr_text(ocr_text, filename)
        )

        # Step 4: AI categorization
        from app.services.ai_engine.categorizer import (
            categorize_transactions_sync,
            is_ai_configured,
        )

        if transactions and is_ai_configured():
            _update_job(
                db, job_id,
                progress=70,
                progress_message="AI categorizing transactions...",
            )
            try:
                transactions = categorize_transactions_sync(transactions)
            except Exception:
                logger.warning(
                    "AI categorization skipped for job %d", job_id, exc_info=True
                )

        _update_job(
            db, job_id,
            progress=80,
            progress_message="Checking for duplicates...",
        )

        # Step 5: Check duplicates (sync version)
        if transactions:
            transactions = check_duplicates_sync(
                transactions, business_id, db
            )

        _update_job(
            db, job_id,
            progress=90,
            progress_message="Finalizing results...",
        )

        # Build result
        result = {
            "file_type": ImportFileType.PDF.value,
            "file_name": filename,
            "statement_period": statement_period,
            "account_info": account_info,
            "transactions": [t.model_dump(mode="json") for t in transactions],
            "total_count": len(transactions),
            "duplicate_count": sum(1 for t in transactions if t.is_duplicate),
            "parse_warnings": parse_warnings if transactions else (
                parse_warnings + [
                    "No transactions could be automatically extracted. "
                    "The statement format may not be supported yet."
                ]
            ),
        }

        _update_job(
            db, job_id,
            status="completed",
            progress=100,
            progress_message="Import parsing complete.",
            result_data=result,
            completed_at=datetime.now(timezone.utc),
        )

        return result

    except Exception as exc:
        error_msg = str(exc)
        error_type = type(exc).__name__

        # Check if we should retry
        if self.request.retries < self.max_retries and isinstance(
            exc, (ConnectionError, TimeoutError)
        ):
            _update_job(
                db, job_id,
                status="running",
                progress_message=f"Retrying ({self.request.retries + 1}/{self.max_retries})...",
                retry_count=self.request.retries + 1,
            )
            db.close()
            raise self.retry(exc=exc)

        # Mark as failed
        _update_job(
            db, job_id,
            status="failed",
            progress_message="Import failed.",
            error_message=error_msg,
            error_type=error_type,
            completed_at=datetime.now(timezone.utc),
        )

        logger.error("PDF import job %d failed: %s", job_id, error_msg)
        return {"error": error_msg}

    finally:
        db.close()
