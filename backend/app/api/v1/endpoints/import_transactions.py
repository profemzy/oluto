"""
Transaction import endpoints.

Two-phase flow:
1. Parse: Upload CSV/PDF → returns extracted transactions for review
   - CSV: parsed inline (fast, typically <1s)
   - PDF: queued as background Celery task (OCR can take 30-120s)
2. Confirm: Submit reviewed transactions → bulk create as draft
"""

import base64
import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.async_job import AsyncJob
from app.api.deps import get_current_active_user, require_business_access
from app.api.helpers import get_business_or_404
from app.schemas.transaction import (
    ImportParseResponse,
    ImportConfirmRequest,
    ImportConfirmResponse,
    TransactionRead,
)
from app.schemas.async_job import AsyncJobCreateResponse
from app.services.import_parser import parse_csv, check_duplicates
from app.services.transaction_service import build_transaction
from app.core.config import settings
from app.services.ai_engine.categorizer import categorize_transactions_async, is_ai_configured

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/import/parse")
async def parse_import_file(
    business_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ImportParseResponse | AsyncJobCreateResponse:
    """
    Upload a CSV or PDF bank statement and get parsed transaction preview.

    **CSV files** are parsed inline and return `ImportParseResponse` immediately.

    **PDF files** are queued as a background task and return `AsyncJobCreateResponse`
    with a `job_id` for polling. The frontend should poll
    `GET /businesses/{id}/transactions/jobs/{job_id}` for progress.

    Supported formats:
    - **CSV**: Bank or credit card statement export
    - **PDF**: Scanned or digital bank statements (requires Azure OCR config)
    """
    require_business_access(business_id, current_user)

    # Validate file type
    filename = file.filename or "unknown"
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if extension not in ("csv", "pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload a .csv or .pdf file.",
        )

    # Read file content
    content = await file.read()

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file uploaded.",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10 MB.",
        )

    # --- CSV: parse inline (fast) ---
    if extension == "csv":
        try:
            result = await parse_csv(content, filename)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e),
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to parse file: {str(e)}",
            )

        # AI categorization (expense detection + CRA category assignment)
        if result.transactions and is_ai_configured():
            try:
                result.transactions = await categorize_transactions_async(
                    result.transactions
                )
            except Exception:
                logger.warning("AI categorization skipped due to error", exc_info=True)

        # Check for duplicates
        if result.transactions:
            result.transactions = await check_duplicates(
                result.transactions, business_id, db
            )
            result.duplicate_count = sum(
                1 for t in result.transactions if t.is_duplicate
            )

        return result

    # --- PDF: queue as background task ---
    if not settings.AZURE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PDF import is not configured. Please set AZURE_API_KEY.",
        )

    # Send file as base64 (Celery uses JSON serialization)
    file_content_b64 = base64.b64encode(content).decode("utf-8")

    # Create the job record first
    job = AsyncJob(
        celery_task_id="",  # Will be updated after task is sent
        job_type="pdf_import",
        status="pending",
        progress=0,
        progress_message="Queued for processing...",
        input_filename=filename,
        input_file_size=len(content),
        business_id=business_id,
        created_by_user_id=current_user.id,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Queue the Celery task
    from app.tasks.import_tasks import process_pdf_import

    task = process_pdf_import.apply_async(
        args=[job.id, file_content_b64, filename, business_id],
        task_id=str(uuid.uuid4()),
    )

    # Update job with Celery task ID
    job.celery_task_id = task.id
    await db.commit()

    return AsyncJobCreateResponse(
        job_id=job.id,
        celery_task_id=task.id,
        status="pending",
        message="PDF import queued. Poll the job status endpoint for progress.",
    )


@router.post(
    "/import/confirm",
    response_model=ImportConfirmResponse,
    status_code=status.HTTP_201_CREATED,
)
async def confirm_import(
    business_id: int,
    request: ImportConfirmRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Confirm and bulk-create transactions from a previously parsed import.

    The user has reviewed the parsed transactions and may have edited or
    deselected some. This endpoint creates all submitted transactions
    with status 'draft' and auto-calculated taxes.
    """
    require_business_access(business_id, current_user)

    if not request.transactions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transactions to import.",
        )

    if len(request.transactions) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 500 transactions per import.",
        )

    business = await get_business_or_404(db, business_id)
    province = business.province or "AB"
    batch_id = str(uuid.uuid4())
    import_source = f"{request.file_type.value}_import"

    created_transactions: list[Transaction] = []

    for item in request.transactions:
        txn = build_transaction(
            vendor_name=item.vendor_name,
            amount=item.amount,
            transaction_date=item.transaction_date,
            category=item.category,
            description=item.description,
            ai_suggested_category=item.ai_suggested_category,
            ai_confidence=item.ai_confidence,
            business_id=business_id,
            province=province,
            import_source=import_source,
            import_batch_id=batch_id,
        )
        db.add(txn)
        created_transactions.append(txn)

    await db.commit()

    # Refresh all to get generated IDs and timestamps
    for txn in created_transactions:
        await db.refresh(txn)

    return ImportConfirmResponse(
        imported_count=len(created_transactions),
        batch_id=batch_id,
        transactions=[TransactionRead.model_validate(t) for t in created_transactions],
    )
