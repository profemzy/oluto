"""Pydantic schemas for AsyncJob background task tracking."""

from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import datetime


class AsyncJobRead(BaseModel):
    """Public representation of a background job."""

    id: int
    celery_task_id: str
    job_type: str
    status: str
    progress: int
    progress_message: Optional[str] = None
    result_data: Optional[Any] = None
    error_message: Optional[str] = None
    error_type: Optional[str] = None
    retry_count: int
    max_retries: int
    input_filename: Optional[str] = None
    input_file_size: Optional[int] = None
    business_id: int
    created_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AsyncJobCreateResponse(BaseModel):
    """Response when a new async job is queued."""

    job_id: int
    celery_task_id: str
    status: str
    message: str


class AsyncJobStatusResponse(BaseModel):
    """Polling response for job status."""

    job_id: int
    celery_task_id: str
    job_type: str
    status: str
    progress: int
    progress_message: Optional[str] = None
    result_data: Optional[Any] = None
    error_message: Optional[str] = None
    retry_count: int
    created_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
