"""
Celery worker entry point.

Run with:
    celery -A app.worker worker --loglevel=info --queues=default,imports

For monitoring:
    celery -A app.worker flower --port=5555
"""

from app.core.celery_app import celery_app  # noqa: F401

# Import all models so SQLAlchemy mappers resolve correctly
import app.db.base  # noqa: F401

# Import all task modules so they are registered with Celery
import app.tasks.import_tasks  # noqa: F401
