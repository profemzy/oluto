"""
Celery application configuration for Oluto background task processing.

Production-ready setup with:
- Task routing to dedicated queues
- Retry policies with exponential backoff
- Result backend with expiry
- Rate limiting for external API calls
- Serialization safety (JSON only)
"""

from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "oluto_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    # --- Serialization ---
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",

    # --- Timezone ---
    timezone="UTC",
    enable_utc=True,

    # --- Result Backend ---
    result_expires=86400,  # Results expire after 24 hours
    result_extended=True,  # Store task args/kwargs in result

    # --- Task Execution ---
    task_acks_late=True,  # Ack after task completes (crash safety)
    task_reject_on_worker_lost=True,  # Requeue if worker dies mid-task
    worker_prefetch_multiplier=1,  # One task at a time per worker (for long tasks)

    # --- Task Routing ---
    task_routes={
        "app.tasks.import_tasks.*": {"queue": "imports"},
        "app.tasks.*": {"queue": "default"},
    },
    task_default_queue="default",

    # --- Retry Defaults ---
    task_default_retry_delay=30,  # 30 seconds
    task_max_retries=3,

    # --- Rate Limiting ---
    task_annotations={
        "app.tasks.import_tasks.process_pdf_import": {
            "rate_limit": "10/m",  # Max 10 PDF OCR calls per minute
        },
    },

    # --- Worker ---
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks (memory leak guard)
    worker_max_memory_per_child=512000,  # 512MB per worker process

    # --- Monitoring ---
    worker_send_task_events=True,
    task_send_sent_event=True,

    # --- Broker ---
    broker_connection_retry_on_startup=True,
    broker_transport_options={
        "visibility_timeout": 600,  # 10 minutes for long-running OCR tasks
    },
)

# Auto-discover tasks from the tasks package
celery_app.autodiscover_tasks(["app.tasks"])
