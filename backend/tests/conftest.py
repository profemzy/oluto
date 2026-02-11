import pytest_asyncio

from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker, AsyncEngine
from sqlalchemy import text
from app.db.session import get_db, Base
from app.main import app
from app.core.config import settings

# CRITICAL: Import all models early to ensure SQLAlchemy registry is populated
from app.db.base import Base  # noqa
from app.models.transaction import Transaction  # noqa - Must import before Business
from app.models.user import Business, User  # noqa
from app.models.async_job import AsyncJob  # noqa


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """Database engine for each test."""
    engine = create_async_engine(
        settings.DATABASE_URL, 
        future=True, 
        pool_pre_ping=True,
        poolclass=None,  # Use NullPool to avoid connection reuse issues in tests
    )
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    """Database session for test setup."""
    # Clean database before test using a separate connection
    async with db_engine.begin() as conn:
        await conn.execute(text("TRUNCATE TABLE users RESTART IDENTITY CASCADE"))
        await conn.execute(text("TRUNCATE TABLE businesses RESTART IDENTITY CASCADE"))
        await conn.execute(text("TRUNCATE TABLE transactions RESTART IDENTITY CASCADE"))
        await conn.execute(text("TRUNCATE TABLE async_jobs RESTART IDENTITY CASCADE"))

    # Create a new session for test setup
    session_factory = async_sessionmaker(
        bind=db_engine, 
        class_=AsyncSession, 
        expire_on_commit=False,
        autoflush=False,
    )
    
    async with session_factory() as session:
        yield session
        # Cleanup: rollback any pending changes
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def async_client(db_engine: AsyncEngine) -> AsyncGenerator[AsyncClient, None]:
    """FastAPI test client with isolated database sessions per request."""
    
    async def override_get_db():
        # Create a new session for each request
        session_factory = async_sessionmaker(
            bind=db_engine, 
            class_=AsyncSession, 
            expire_on_commit=False,
            autoflush=False,
        )
        async with session_factory() as session:
            try:
                yield session
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), 
        base_url="http://test"
    ) as client:
        yield client

    app.dependency_overrides.clear()
