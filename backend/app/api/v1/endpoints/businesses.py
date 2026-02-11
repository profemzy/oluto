from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core.security import get_password_hash
from app.models.user import Business, User
from app.schemas.business import (
    BusinessCreate,
    BusinessUpdate,
    BusinessResponse,
    UserInvite,
)
from app.schemas.auth import UserResponse
from app.api.deps import get_current_active_user, require_business_access
from app.api.helpers import get_business_or_404, get_user_by_email

router = APIRouter()


@router.post("", response_model=BusinessResponse, status_code=status.HTTP_201_CREATED)
async def create_business(
    business_in: BusinessCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new business (client workspace).

    Typically used by bookkeepers to onboard new clients.
    Creates the business and associates current user as the primary owner.
    """
    # Create business
    new_business = Business(
        name=business_in.name,
        province=business_in.province,
        tax_profile=business_in.tax_profile,
    )
    db.add(new_business)
    await db.flush()  # Get the ID without committing

    # Associate current user with this business if they don't have one
    if current_user.business_id is None:
        current_user.business_id = new_business.id

    await db.commit()
    await db.refresh(new_business)

    return new_business


@router.get("", response_model=List[BusinessResponse])
async def list_businesses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List all businesses accessible to the current user.

    - Regular users: see only their own business
    - Bookkeepers/Admins (future): see all client businesses
    """
    # For now, users can only see their own business
    if current_user.business_id is None:
        return []

    stmt = select(Business).where(Business.id == current_user.business_id)
    result = await db.execute(stmt)
    businesses = result.scalars().all()

    return list(businesses)


@router.get("/{business_id}", response_model=BusinessResponse)
async def get_business(
    business_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get business details by ID.
    Requires access permission.
    """
    require_business_access(business_id, current_user)
    business = await get_business_or_404(db, business_id)
    return business


@router.patch("/{business_id}", response_model=BusinessResponse)
async def update_business(
    business_id: int,
    business_in: BusinessUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update business profile.
    Requires owner/admin access.
    """
    require_business_access(business_id, current_user)
    business = await get_business_or_404(db, business_id)

    # Update fields
    if business_in.name is not None:
        business.name = business_in.name
    if business_in.province is not None:
        business.province = business_in.province
    if business_in.tax_profile is not None:
        business.tax_profile = business_in.tax_profile

    await db.commit()
    await db.refresh(business)

    return business


@router.post(
    "/{business_id}/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def invite_user_to_business(
    business_id: int,
    invite: UserInvite,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Invite a new user to the business.

    Creates a user account and sends invitation email (future).
    Requires owner/admin access.
    """
    require_business_access(business_id, current_user)

    existing_user = await get_user_by_email(db, invite.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Create placeholder password (user will set on first login)
    # In production, send email with magic link or temp password
    temp_password = "ChangeMe123!"  # TODO: Generate secure temp password
    hashed_password = get_password_hash(temp_password)

    new_user = User(
        email=invite.email,
        hashed_password=hashed_password,
        full_name=invite.full_name or "",
        role=invite.role,
        business_id=business_id,
        is_active=True,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # TODO: Send invitation email with temp password or magic link

    return new_user
