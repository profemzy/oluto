import pytest
from decimal import Decimal
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import Business, User
from app.core.security import get_password_hash


async def _create_business_user_and_login(
    db_session: AsyncSession,
    async_client: AsyncClient,
    email: str = "owner@test.com",
    province: str = "ON",
) -> tuple[int, str]:
    """Helper: create a business + user and return (business_id, token)."""
    business = Business(name="Test Co", province=province)
    db_session.add(business)
    await db_session.flush()

    user = User(
        email=email,
        hashed_password=get_password_hash("testpass"),
        full_name="Test User",
        role="owner",
        business_id=business.id,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()

    login_response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": "testpass"},
    )
    token = login_response.json()["access_token"]
    return business.id, token


@pytest.mark.asyncio
async def test_create_transaction(async_client: AsyncClient, db_session: AsyncSession):
    """Test creating a new transaction."""
    biz_id, token = await _create_business_user_and_login(db_session, async_client)

    response = await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions",
        json={
            "vendor_name": "Staples",
            "amount": "234.50",
            "transaction_date": "2026-02-01",
            "category": "Office expenses",
            "description": "Office supplies",
            "source_device": "web",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["vendor_name"] == "Staples"
    assert Decimal(data["amount"]) == Decimal("234.50")
    assert data["status"] == "draft"
    assert data["business_id"] == biz_id
    assert data["category"] == "Office expenses"
    # ON has 13% HST, so gst_amount should have the HST value
    assert Decimal(data["gst_amount"]) > 0


@pytest.mark.asyncio
async def test_list_transactions(async_client: AsyncClient, db_session: AsyncSession):
    """Test listing transactions with optional filtering."""
    biz_id, token = await _create_business_user_and_login(db_session, async_client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create multiple transactions
    for vendor in ["Vendor A", "Vendor B", "Vendor C"]:
        await async_client.post(
            f"/api/v1/businesses/{biz_id}/transactions",
            json={
                "vendor_name": vendor,
                "amount": "100.00",
                "transaction_date": "2026-02-01",
                "category": "Office expenses",
            },
            headers=headers,
        )

    # List all
    response = await async_client.get(
        f"/api/v1/businesses/{biz_id}/transactions",
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

    # Filter by status
    response = await async_client.get(
        f"/api/v1/businesses/{biz_id}/transactions?status=draft",
        headers=headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 3

    # Filter by non-existent status
    response = await async_client.get(
        f"/api/v1/businesses/{biz_id}/transactions?status=posted",
        headers=headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 0


@pytest.mark.asyncio
async def test_get_single_transaction(async_client: AsyncClient, db_session: AsyncSession):
    """Test getting a single transaction by ID."""
    biz_id, token = await _create_business_user_and_login(db_session, async_client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create a transaction
    create_response = await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions",
        json={
            "vendor_name": "Tim Hortons",
            "amount": "12.50",
            "transaction_date": "2026-02-05",
            "category": "Meals and entertainment",
        },
        headers=headers,
    )
    txn_id = create_response.json()["id"]

    # Get it back
    response = await async_client.get(
        f"/api/v1/businesses/{biz_id}/transactions/{txn_id}",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["vendor_name"] == "Tim Hortons"


@pytest.mark.asyncio
async def test_update_transaction(async_client: AsyncClient, db_session: AsyncSession):
    """Test updating a transaction."""
    biz_id, token = await _create_business_user_and_login(db_session, async_client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create
    create_response = await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions",
        json={
            "vendor_name": "Wrong Vendor",
            "amount": "50.00",
            "transaction_date": "2026-02-01",
        },
        headers=headers,
    )
    txn_id = create_response.json()["id"]

    # Update
    response = await async_client.patch(
        f"/api/v1/businesses/{biz_id}/transactions/{txn_id}",
        json={"vendor_name": "Correct Vendor", "status": "ready"},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["vendor_name"] == "Correct Vendor"
    assert response.json()["status"] == "ready"


@pytest.mark.asyncio
async def test_delete_transaction(async_client: AsyncClient, db_session: AsyncSession):
    """Test deleting a transaction."""
    biz_id, token = await _create_business_user_and_login(db_session, async_client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create
    create_response = await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions",
        json={
            "vendor_name": "To Delete",
            "amount": "10.00",
            "transaction_date": "2026-02-01",
        },
        headers=headers,
    )
    txn_id = create_response.json()["id"]

    # Delete
    response = await async_client.delete(
        f"/api/v1/businesses/{biz_id}/transactions/{txn_id}",
        headers=headers,
    )
    assert response.status_code == 204

    # Verify it's gone
    response = await async_client.get(
        f"/api/v1/businesses/{biz_id}/transactions/{txn_id}",
        headers=headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_transaction_tenant_isolation(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test that users cannot access transactions from other businesses."""
    # Create two businesses with users
    biz1_id, token1 = await _create_business_user_and_login(
        db_session, async_client, email="user1@test.com"
    )
    biz2_id, token2 = await _create_business_user_and_login(
        db_session, async_client, email="user2@test.com"
    )

    # Create a transaction for business 1
    create_response = await async_client.post(
        f"/api/v1/businesses/{biz1_id}/transactions",
        json={
            "vendor_name": "Private Vendor",
            "amount": "500.00",
            "transaction_date": "2026-02-01",
        },
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert create_response.status_code == 201

    # User 2 should NOT be able to list business 1's transactions
    response = await async_client.get(
        f"/api/v1/businesses/{biz1_id}/transactions",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_dashboard_summary(async_client: AsyncClient, db_session: AsyncSession):
    """Test the dashboard summary endpoint."""
    biz_id, token = await _create_business_user_and_login(db_session, async_client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create some transactions
    await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions",
        json={
            "vendor_name": "Client Payment",
            "amount": "1000.00",
            "transaction_date": "2026-02-01",
            "category": "Revenue",
        },
        headers=headers,
    )

    # Get summary
    response = await async_client.get(
        f"/api/v1/businesses/{biz_id}/transactions/summary",
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_revenue" in data
    assert "total_expenses" in data
    assert "tax_reserved" in data
    assert "safe_to_spend" in data
    assert "exceptions_count" in data
    assert "transactions_count" in data
    assert data["transactions_count"] == 1
    assert isinstance(data["recent_transactions"], list)
    assert isinstance(data["exceptions"], list)


@pytest.mark.asyncio
async def test_dashboard_summary_empty(async_client: AsyncClient, db_session: AsyncSession):
    """Test dashboard summary with no transactions."""
    biz_id, token = await _create_business_user_and_login(db_session, async_client)

    response = await async_client.get(
        f"/api/v1/businesses/{biz_id}/transactions/summary",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["transactions_count"] == 0
    assert Decimal(data["total_revenue"]) == 0
    assert Decimal(data["total_expenses"]) == 0
