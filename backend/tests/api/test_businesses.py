import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import Business, User
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_create_business(async_client: AsyncClient, db_session: AsyncSession):
    """Test creating a new business via API."""
    # First, create a business for the user
    existing_business = Business(name="Existing Business", province="BC")
    db_session.add(existing_business)
    await db_session.flush()

    # Create and login a user associated with the existing business
    test_user = User(
        email="bookkeeper@test.com",
        hashed_password=get_password_hash("testpass"),
        full_name="Test Bookkeeper",
        role="admin",
        business_id=existing_business.id,
        is_active=True,
    )
    db_session.add(test_user)
    await db_session.commit()

    # Login
    login_response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "bookkeeper@test.com", "password": "testpass"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    # Create business
    response = await async_client.post(
        "/api/v1/businesses",
        json={"name": "Test Business", "province": "ON"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Business"
    assert data["province"] == "ON"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_businesses_tenant_scoping(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test that users can only see their own businesses."""
    # Create two businesses
    business1 = Business(name="Business 1")
    business2 = Business(name="Business 2")
    db_session.add_all([business1, business2])
    await db_session.flush()

    # Create two users, each associated with different business
    user1 = User(
        email="user1@test.com",
        hashed_password=get_password_hash("testpass"),
        full_name="User 1",
        role="owner",
        business_id=business1.id,
        is_active=True,
    )
    user2 = User(
        email="user2@test.com",
        hashed_password=get_password_hash("testpass"),
        full_name="User 2",
        role="owner",
        business_id=business2.id,
        is_active=True,
    )
    db_session.add_all([user1, user2])
    await db_session.commit()

    # Login as user1
    login_response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "user1@test.com", "password": "testpass"},
    )
    token1 = login_response.json()["access_token"]

    # List businesses for user1
    response = await async_client.get(
        "/api/v1/businesses", headers={"Authorization": f"Bearer {token1}"}
    )

    assert response.status_code == 200
    businesses = response.json()
    assert len(businesses) == 1
    assert businesses[0]["name"] == "Business 1"

    # Verify user1 CANNOT access business2
    response = await async_client.get(
        f"/api/v1/businesses/{business2.id}",
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert response.status_code == 403  # Forbidden


@pytest.mark.asyncio
async def test_invite_user_to_business(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test inviting a user to a business."""
    # Create business and owner
    business = Business(name="Test Co")
    db_session.add(business)
    await db_session.flush()

    owner = User(
        email="owner@test.com",
        hashed_password=get_password_hash("testpass"),
        full_name="Owner",
        role="owner",
        business_id=business.id,
        is_active=True,
    )
    db_session.add(owner)
    await db_session.commit()

    # Login as owner
    login_response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "owner@test.com", "password": "testpass"},
    )
    token = login_response.json()["access_token"]

    # Invite new user
    response = await async_client.post(
        f"/api/v1/businesses/{business.id}/users",
        json={"email": "newuser@test.com", "role": "staff", "full_name": "New User"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "staff"
    assert data["business_id"] == business.id
