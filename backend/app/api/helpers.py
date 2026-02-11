"""
Reusable CRUD and lookup helpers for API endpoints.

Eliminates repeated select-by-id + 404-check patterns
across endpoint modules.
"""

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import Business, User
from app.models.transaction import Transaction


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    """Look up a user by email. Returns None if not found."""
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_business_or_404(db: AsyncSession, business_id: int) -> Business:
    """Fetch a business by ID or raise 404."""
    business = await db.get(Business, business_id)
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found",
        )
    return business


async def get_transaction_for_business(
    db: AsyncSession, transaction_id: int, business_id: int
) -> Transaction:
    """Fetch a transaction scoped to a business, or raise 404."""
    stmt = select(Transaction).where(
        Transaction.id == transaction_id,
        Transaction.business_id == business_id,
    )
    result = await db.execute(stmt)
    txn = result.scalars().first()
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    return txn
