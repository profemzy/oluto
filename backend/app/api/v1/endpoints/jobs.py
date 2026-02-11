"""
Background job status and management endpoints.

Provides polling endpoint for frontend to track async task progress.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.db.session import get_db
from app.models.user import User
from app.models.async_job import AsyncJob
from app.api.deps import get_current_active_user, require_business_access
from app.schemas.async_job import AsyncJobStatusResponse, AsyncJobRead

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/jobs/{job_id}", response_model=AsyncJobStatusResponse)
async def get_job_status(
    business_id: int,
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get the status of a background job.

    Used by the frontend to poll for import progress. Returns:
    - status: pending, running, completed, failed
    - progress: 0-100
    - progress_message: Human-readable status
    - result_data: Full result when completed
    - error_message: Error details when failed
    """
    require_business_access(business_id, current_user)

    job = await db.get(AsyncJob, job_id)
    if not job or job.business_id != business_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    return AsyncJobStatusResponse(
        job_id=job.id,
        celery_task_id=job.celery_task_id,
        job_type=job.job_type,
        status=job.status,
        progress=job.progress,
        progress_message=job.progress_message,
        result_data=job.result_data,
        error_message=job.error_message,
        retry_count=job.retry_count,
        created_at=job.created_at,
        started_at=job.started_at,
        completed_at=job.completed_at,
    )


@router.get("/jobs", response_model=list[AsyncJobRead])
async def list_jobs(
    business_id: int,
    job_type: str | None = None,
    status_filter: str | None = None,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List background jobs for a business, most recent first."""
    require_business_access(business_id, current_user)

    filters = [AsyncJob.business_id == business_id]
    if job_type:
        filters.append(AsyncJob.job_type == job_type)
    if status_filter:
        filters.append(AsyncJob.status == status_filter)

    stmt = (
        select(AsyncJob)
        .where(and_(*filters))
        .order_by(AsyncJob.created_at.desc())
        .limit(min(limit, 100))
    )

    result = await db.execute(stmt)
    jobs = result.scalars().all()
    return [AsyncJobRead.model_validate(j) for j in jobs]
