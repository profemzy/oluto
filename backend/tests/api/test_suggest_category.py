"""Tests for the suggest-category endpoint."""

import pytest
from unittest.mock import patch
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai_engine.categorizer import CategorySuggestion


async def _create_business_user_and_login(
    db_session: AsyncSession,
    async_client: AsyncClient,
    email: str = "suggest@test.com",
) -> tuple[int, str]:
    """Helper: create a business + user and return (business_id, token)."""
    from app.models.user import Business, User
    from app.core.security import get_password_hash

    business = Business(name="Suggest Test Co", province="ON")
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
async def test_suggest_category_returns_suggestion(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test that suggest-category returns a valid CRA category."""
    biz_id, token = await _create_business_user_and_login(
        db_session, async_client
    )

    with patch(
        "app.api.v1.endpoints.transactions.is_ai_configured",
        return_value=True,
    ):
        with patch(
            "app.api.v1.endpoints.transactions.suggest_category_async"
        ) as mock_suggest:
            mock_suggest.return_value = CategorySuggestion(
                category="Office expenses",
                confidence=0.92,
                reasoning="Staples is an office supply retailer",
            )

            response = await async_client.post(
                f"/api/v1/businesses/{biz_id}/transactions/suggest-category",
                json={"vendor_name": "Staples"},
                headers={"Authorization": f"Bearer {token}"},
            )

    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Office expenses"
    assert data["confidence"] == 0.92
    assert data["reasoning"] == "Staples is an office supply retailer"


@pytest.mark.asyncio
async def test_suggest_category_no_api_key(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test that endpoint returns fallback when no API key."""
    biz_id, token = await _create_business_user_and_login(
        db_session, async_client, email="suggest_nokey@test.com"
    )

    with patch(
        "app.api.v1.endpoints.transactions.is_ai_configured",
        return_value=False,
    ):
        response = await async_client.post(
            f"/api/v1/businesses/{biz_id}/transactions/suggest-category",
            json={"vendor_name": "Staples"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["confidence"] == 0.0


@pytest.mark.asyncio
async def test_suggest_category_requires_auth(async_client: AsyncClient):
    """Test that endpoint requires authentication."""
    response = await async_client.post(
        "/api/v1/businesses/1/transactions/suggest-category",
        json={"vendor_name": "Staples"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_suggest_category_requires_business_access(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test that endpoint checks business access."""
    _, token = await _create_business_user_and_login(
        db_session, async_client, email="suggest_biz@test.com"
    )

    response = await async_client.post(
        "/api/v1/businesses/9999/transactions/suggest-category",
        json={"vendor_name": "Staples"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
