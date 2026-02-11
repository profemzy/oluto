from typing import Optional
from datetime import date
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionCreate,
    TransactionRead,
    TransactionUpdate,
    DashboardSummary,
    StatusCounts,
    BulkStatusUpdateRequest,
    BulkStatusUpdateResponse,
    CategorySuggestRequest,
    CategorySuggestResponse,
)
from app.api.deps import get_current_active_user, require_business_access
from app.api.helpers import get_business_or_404, get_transaction_for_business
from app.services.transaction_service import build_transaction
from app.services.ai_engine.categorizer import suggest_category_async, is_ai_configured

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
async def get_transaction_summary(
    business_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get dashboard summary stats for a business.

    Returns revenue, expenses, tax reserved, safe-to-spend,
    recent transactions, and exception items.
    """
    require_business_access(business_id, current_user)

    base_filter = Transaction.business_id == business_id

    # Revenue: sum of positive amounts with status 'posted' or 'ready'
    revenue_stmt = select(func.coalesce(func.sum(Transaction.amount), Decimal("0.00"))).where(
        base_filter,
        Transaction.amount > 0,
        Transaction.status.in_(["posted", "ready"]),
    )
    revenue_result = await db.execute(revenue_stmt)
    total_revenue = revenue_result.scalar() or Decimal("0.00")

    # Expenses: sum of negative amounts
    expenses_stmt = select(func.coalesce(func.sum(Transaction.amount), Decimal("0.00"))).where(
        base_filter,
        Transaction.amount < 0,
        Transaction.status.in_(["posted", "ready"]),
    )
    expenses_result = await db.execute(expenses_stmt)
    total_expenses = abs(expenses_result.scalar() or Decimal("0.00"))

    # Tax reserved: sum of gst + pst amounts for posted/ready transactions only
    tax_stmt = select(
        func.coalesce(func.sum(Transaction.gst_amount + Transaction.pst_amount), Decimal("0.00"))
    ).where(
        base_filter,
        Transaction.status.in_(["posted", "ready"]),
    )
    tax_result = await db.execute(tax_stmt)
    tax_reserved = tax_result.scalar() or Decimal("0.00")

    # Safe to spend
    safe_to_spend = total_revenue - total_expenses - tax_reserved

    # Exceptions: transactions in inbox_user or inbox_firm status
    exceptions_stmt = (
        select(Transaction)
        .where(base_filter, Transaction.status.in_(["inbox_user", "inbox_firm"]))
        .order_by(Transaction.created_at.desc())
        .limit(10)
    )
    exceptions_result = await db.execute(exceptions_stmt)
    exceptions = list(exceptions_result.scalars().all())

    # Exceptions count
    exceptions_count_stmt = select(func.count()).select_from(Transaction).where(
        base_filter, Transaction.status.in_(["inbox_user", "inbox_firm"])
    )
    exceptions_count_result = await db.execute(exceptions_count_stmt)
    exceptions_count = exceptions_count_result.scalar() or 0

    # Total transactions count
    count_stmt = select(func.count()).select_from(Transaction).where(base_filter)
    count_result = await db.execute(count_stmt)
    transactions_count = count_result.scalar() or 0

    # Recent transactions
    recent_stmt = (
        select(Transaction)
        .where(base_filter)
        .order_by(Transaction.created_at.desc())
        .limit(5)
    )
    recent_result = await db.execute(recent_stmt)
    recent_transactions = list(recent_result.scalars().all())

    # Status counts
    status_counts_stmt = select(
        Transaction.status, func.count()
    ).where(base_filter).group_by(Transaction.status)
    status_counts_result = await db.execute(status_counts_stmt)
    status_counts_raw = {row[0]: row[1] for row in status_counts_result.all()}
    status_counts = StatusCounts(**{
        k: status_counts_raw.get(k, 0)
        for k in ["draft", "processing", "inbox_user", "inbox_firm", "ready", "posted"]
    })

    return DashboardSummary(
        total_revenue=total_revenue,
        total_expenses=total_expenses,
        tax_reserved=tax_reserved,
        safe_to_spend=safe_to_spend,
        exceptions_count=exceptions_count,
        transactions_count=transactions_count,
        status_counts=status_counts,
        recent_transactions=recent_transactions,
        exceptions=exceptions,
    )


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    business_id: int,
    txn_in: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new transaction for the business.

    Auto-calculates GST/HST/PST based on the business's province.
    """
    require_business_access(business_id, current_user)

    business = await get_business_or_404(db, business_id)
    province = business.province or "AB"

    new_txn = build_transaction(
        vendor_name=txn_in.vendor_name,
        amount=txn_in.amount,
        currency=txn_in.currency,
        transaction_date=txn_in.transaction_date,
        category=txn_in.category,
        description=txn_in.description,
        ai_suggested_category=txn_in.ai_suggested_category,
        ai_confidence=txn_in.ai_confidence,
        business_id=business_id,
        province=province,
    )
    db.add(new_txn)
    await db.commit()
    await db.refresh(new_txn)

    return new_txn


@router.post("/suggest-category", response_model=CategorySuggestResponse)
async def suggest_category(
    business_id: int,
    request: CategorySuggestRequest,
    current_user: User = Depends(get_current_active_user),
):
    """
    Get an AI-suggested CRA expense category for a transaction.

    Provide a vendor name and optionally amount/description.
    Returns a suggested category with confidence score.
    Used for real-time suggestions while creating transactions.
    """
    require_business_access(business_id, current_user)

    if not is_ai_configured():
        return CategorySuggestResponse(
            category="Other expenses",
            confidence=0.0,
            reasoning="AI categorization not configured.",
        )

    suggestion = await suggest_category_async(
        vendor_name=request.vendor_name,
        amount=request.amount,
        description=request.description,
    )

    return CategorySuggestResponse(
        category=suggestion.category,
        confidence=suggestion.confidence,
        reasoning=suggestion.reasoning,
    )


@router.get("", response_model=list[TransactionRead])
async def list_transactions(
    business_id: int,
    transaction_status: Optional[str] = Query(None, alias="status"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List transactions for a business with optional filtering.

    - **status**: Filter by transaction status (draft, processing, inbox_user, inbox_firm, ready, posted)
    - **start_date**: Filter transactions on or after this date
    - **end_date**: Filter transactions on or before this date
    - **skip**: Number of records to skip (pagination offset)
    - **limit**: Max records to return (1-100, default 50)
    """
    require_business_access(business_id, current_user)

    stmt = select(Transaction).where(Transaction.business_id == business_id)

    if transaction_status:
        stmt = stmt.where(Transaction.status == transaction_status)
    if start_date:
        stmt = stmt.where(Transaction.transaction_date >= start_date)
    if end_date:
        stmt = stmt.where(Transaction.transaction_date <= end_date)

    stmt = stmt.order_by(Transaction.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(stmt)
    transactions = result.scalars().all()

    return list(transactions)


@router.patch("/bulk-status", response_model=BulkStatusUpdateResponse)
async def bulk_update_status(
    business_id: int,
    request: BulkStatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Bulk-update the status of multiple transactions.

    Provide either `transaction_ids` (list of IDs) or `batch_id` (import batch UUID).
    All matched transactions scoped to this business will be updated.
    Maximum 500 transactions per request.
    """
    require_business_access(business_id, current_user)

    # Build query based on provided identifiers
    stmt = select(Transaction).where(Transaction.business_id == business_id)

    if request.batch_id:
        stmt = stmt.where(Transaction.import_batch_id == request.batch_id)
    elif request.transaction_ids:
        if len(request.transaction_ids) > 500:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 500 transactions per bulk update.",
            )
        stmt = stmt.where(Transaction.id.in_(request.transaction_ids))

    result = await db.execute(stmt)
    transactions = list(result.scalars().all())

    if not transactions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No matching transactions found.",
        )

    # Update status on all matched transactions
    for txn in transactions:
        txn.status = request.status

    await db.commit()

    # Refresh all to get updated timestamps
    for txn in transactions:
        await db.refresh(txn)

    return BulkStatusUpdateResponse(
        updated_count=len(transactions),
        transactions=[TransactionRead.model_validate(t) for t in transactions],
    )


@router.get("/{transaction_id}", response_model=TransactionRead)
async def get_transaction(
    business_id: int,
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a single transaction by ID."""
    require_business_access(business_id, current_user)
    txn = await get_transaction_for_business(db, transaction_id, business_id)
    return txn


@router.patch("/{transaction_id}", response_model=TransactionRead)
async def update_transaction(
    business_id: int,
    transaction_id: int,
    txn_in: TransactionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update a transaction's fields.

    Only non-null fields in the request body will be updated.
    """
    require_business_access(business_id, current_user)
    txn = await get_transaction_for_business(db, transaction_id, business_id)

    update_data = txn_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(txn, field, value)

    await db.commit()
    await db.refresh(txn)

    return txn


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    business_id: int,
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a transaction."""
    require_business_access(business_id, current_user)
    txn = await get_transaction_for_business(db, transaction_id, business_id)

    await db.delete(txn)
    await db.commit()
