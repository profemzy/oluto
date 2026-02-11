import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Oluto Backend Starting...")

    # Verify Redis connectivity
    try:
        import redis

        r = redis.from_url(settings.CELERY_BROKER_URL)
        r.ping()
        logger.info("Redis connected at %s", settings.CELERY_BROKER_URL)
    except Exception as e:
        logger.warning("Redis not available: %s (background tasks will not work)", e)

    yield

    # Shutdown logic
    logger.info("Oluto Backend Stopping...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.5.0",
    description="Financial Autopilot for Canadian Small Business",
    lifespan=lifespan,
)

# CORS middleware - allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health")
async def health_check():
    """Health check with Redis and DB status."""
    health = {
        "status": "operational",
        "version": "1.5.0",
        "services": {
            "api": "ok",
            "redis": "unknown",
            "database": "unknown",
        },
    }

    # Check Redis
    try:
        import redis

        r = redis.from_url(settings.CELERY_BROKER_URL, socket_timeout=2)
        r.ping()
        health["services"]["redis"] = "ok"
    except Exception:
        health["services"]["redis"] = "unavailable"

    # Check Database
    try:
        from sqlalchemy import text
        from app.db.session import AsyncSessionLocal

        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        health["services"]["database"] = "ok"
    except Exception:
        health["services"]["database"] = "unavailable"
        health["status"] = "degraded"

    return health
