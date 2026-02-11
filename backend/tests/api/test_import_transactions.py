import pytest
from decimal import Decimal
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import patch, MagicMock
from app.models.user import Business, User
from app.core.security import get_password_hash


async def _create_business_user_and_login(
    db_session: AsyncSession,
    async_client: AsyncClient,
    email: str = "import_owner@test.com",
    province: str = "BC",
) -> tuple[int, str]:
    """Helper: create a business + user and return (business_id, token)."""
    business = Business(name="Import Test Co", province=province)
    db_session.add(business)
    await db_session.flush()

    user = User(
        email=email,
        hashed_password=get_password_hash("testpass"),
        full_name="Import Tester",
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


# --- CSV Parse Tests ---


@pytest.mark.asyncio
async def test_parse_csv_credit_card_format(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test parsing a BMO credit card CSV with single amount column and CR suffix."""
    biz_id, token = await _create_business_user_and_login(
        db_session, async_client, email="csv_cc@test.com"
    )

    csv_content = (
        b"TRANS DATE,POSTING DATE,DESCRIPTION,AMOUNT ($)\n"
        b"Jan. 5,Jan. 6,INTUIT *QBooks Online TORONTO ON,49.28\n"
        b"Jan. 6,Jan. 7,INTUIT *QBooks Online TORONTO ON,15.68 CR\n"
        b"Jan. 4,Jan. 7,ESSO CIRCLE K CHILLIWACK BC,32.52\n"
    )

    response = await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions/import/parse",
        files={"file": ("statement.csv", csv_content, "text/csv")},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["file_type"] == "csv"
    assert data["total_count"] == 3
    assert len(data["transactions"]) == 3

    # First transaction: expense (no CR suffix = negative)
    assert data["transactions"][0]["vendor_name"] == "INTUIT *QBooks Online TORONTO ON"
    assert Decimal(data["transactions"][0]["amount"]) == Decimal("-49.28")

    # Second transaction: credit (CR suffix = positive)
    assert Decimal(data["transactions"][1]["amount"]) == Decimal("15.68")

    # Third transaction: expense
    assert Decimal(data["transactions"][2]["amount"]) == Decimal("-32.52")


@pytest.mark.asyncio
async def test_parse_csv_bank_format(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test parsing a BMO bank CSV with separate debit/credit columns."""
    biz_id, token = await _create_business_user_and_login(
        db_session, async_client, email="csv_bank@test.com"
    )

    csv_content = (
        b"Date,Description,Amounts debited from your account ($),Amounts credited to your account ($),Balance ($)\n"
        b"Jan 08,Online Transfer TF 2736#8921-633,,250.00,273.23\n"
        b"Jan 08,INTERAC e-Transfer Sent,250.00,,23.23\n"
        b"Jan 30,INTERAC e-Transfer Fee,1.50,,21.73\n"
    )

    response = await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions/import/parse",
        files={"file": ("bank_statement.csv", csv_content, "text/csv")},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["file_type"] == "csv"
    assert data["total_count"] == 3

    # Credit (incoming transfer)
    assert Decimal(data["transactions"][0]["amount"]) == Decimal("250.00")

    # Debit (outgoing e-transfer)
    assert Decimal(data["transactions"][1]["amount"]) == Decimal("-250.00")

    # Fee (debit)
    assert Decimal(data["transactions"][2]["amount"]) == Decimal("-1.50")


@pytest.mark.asyncio
async def test_parse_csv_empty_file(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test error handling for empty CSV."""
    biz_id, token = await _create_business_user_and_login(
        db_session, async_client, email="csv_empty@test.com"
    )

    response = await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions/import/parse",
        files={"file": ("empty.csv", b"", "text/csv")},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 400
    assert "Empty file" in response.json()["detail"]


@pytest.mark.asyncio
async def test_parse_unsupported_file_type(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test rejection of non-CSV/PDF files."""
    biz_id, token = await _create_business_user_and_login(
        db_session, async_client, email="csv_bad@test.com"
    )

    response = await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions/import/parse",
        files={"file": ("data.xlsx", b"fake xlsx content", "application/vnd.openxmlformats")},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


# --- Confirm Tests ---


@pytest.mark.asyncio
async def test_confirm_import(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test bulk creation of imported transactions."""
    biz_id, token = await _create_business_user_and_login(
        db_session, async_client, email="confirm@test.com"
    )
    headers = {"Authorization": f"Bearer {token}"}

    response = await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions/import/confirm",
        json={
            "file_type": "csv",
            "transactions": [
                {
                    "transaction_date": "2026-01-05",
                    "vendor_name": "INTUIT *QBooks Online",
                    "amount": "-49.28",
                    "category": "Office expenses",
                },
                {
                    "transaction_date": "2026-01-04",
                    "vendor_name": "ESSO CIRCLE K",
                    "amount": "-32.52",
                    "category": "Fuel costs",
                },
            ],
        },
        headers=headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["imported_count"] == 2
    assert data["batch_id"]  # Non-empty UUID
    assert len(data["transactions"]) == 2

    # Verify transactions were created
    for txn in data["transactions"]:
        assert txn["status"] == "draft"
        assert txn["import_source"] == "csv_import"
        assert txn["import_batch_id"] == data["batch_id"]
        assert txn["business_id"] == biz_id

    # Verify tax was calculated (BC: 5% GST + 7% PST)
    txn1 = data["transactions"][0]
    assert Decimal(txn1["gst_amount"]) != Decimal("0.00") or Decimal(txn1["pst_amount"]) != Decimal("0.00")


@pytest.mark.asyncio
async def test_confirm_import_empty_list(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test error when confirming with no transactions."""
    biz_id, token = await _create_business_user_and_login(
        db_session, async_client, email="confirm_empty@test.com"
    )

    response = await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions/import/confirm",
        json={"file_type": "csv", "transactions": []},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 400
    assert "No transactions to import" in response.json()["detail"]


# --- Deduplication Tests ---


@pytest.mark.asyncio
async def test_duplicate_detection(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test that existing transactions are flagged as duplicates during parse."""
    biz_id, token = await _create_business_user_and_login(
        db_session, async_client, email="dedup@test.com"
    )
    headers = {"Authorization": f"Bearer {token}"}

    # First create a transaction that will be a "duplicate"
    await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions",
        json={
            "vendor_name": "ESSO CIRCLE K",
            "amount": "-32.52",
            "transaction_date": "2026-01-04",
            "source_device": "web",
        },
        headers=headers,
    )

    # Now import a CSV that contains the same transaction
    csv_content = (
        b"TRANS DATE,POSTING DATE,DESCRIPTION,AMOUNT ($)\n"
        b"Jan. 4,Jan. 7,ESSO CIRCLE K CHILLIWACK BC,32.52\n"
        b"Jan. 5,Jan. 6,INTUIT *QBooks Online TORONTO ON,49.28\n"
    )

    response = await async_client.post(
        f"/api/v1/businesses/{biz_id}/transactions/import/parse",
        files={"file": ("statement.csv", csv_content, "text/csv")},
        headers=headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["duplicate_count"] == 1

    # ESSO should be flagged as duplicate
    esso = data["transactions"][0]
    assert esso["vendor_name"].startswith("ESSO CIRCLE K")
    assert esso["is_duplicate"] is True
    assert esso["duplicate_transaction_id"] is not None

    # INTUIT should not be a duplicate
    intuit = data["transactions"][1]
    assert intuit["is_duplicate"] is False


# --- PDF Parse Tests (async via Celery) ---


@pytest.mark.asyncio
async def test_parse_pdf_queues_async_job(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test that PDF upload creates an AsyncJob and queues a Celery task.

    PDF imports are now processed asynchronously via Celery.
    The endpoint returns an AsyncJobCreateResponse with a job_id for polling,
    rather than parsed results inline.
    """
    biz_id, token = await _create_business_user_and_login(
        db_session, async_client, email="pdf_cc@test.com"
    )

    # Mock the Celery task's apply_async to avoid needing a running broker
    mock_async_result = MagicMock()
    mock_async_result.id = "fake-celery-task-id-12345"

    with patch("app.api.v1.endpoints.import_transactions.settings") as mock_settings:
        mock_settings.AZURE_API_KEY = "fake-key"
        mock_settings.AZURE_OCR_URL = "https://fake.url/ocr"
        mock_settings.AZURE_OCR_MODEL = "mistral-document-ai-2505"

        with patch(
            "app.tasks.import_tasks.process_pdf_import.apply_async",
            return_value=mock_async_result,
        ):
            response = await async_client.post(
                f"/api/v1/businesses/{biz_id}/transactions/import/parse",
                files={"file": ("January 28, 2026.pdf", b"fake pdf content", "application/pdf")},
                headers={"Authorization": f"Bearer {token}"},
            )

    assert response.status_code == 200
    data = response.json()

    # Verify async job response shape
    assert "job_id" in data
    assert data["celery_task_id"] == "fake-celery-task-id-12345"
    assert data["status"] == "pending"
    assert "message" in data

    # Verify job was persisted in the database
    from app.models.async_job import AsyncJob

    job = await db_session.get(AsyncJob, data["job_id"])
    assert job is not None
    assert job.job_type == "pdf_import"
    assert job.status == "pending"
    assert job.business_id == biz_id
    assert job.input_filename == "January 28, 2026.pdf"


@pytest.mark.asyncio
async def test_parse_pdf_requires_azure_key(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test that PDF import returns 503 when AZURE_API_KEY is not configured."""
    biz_id, token = await _create_business_user_and_login(
        db_session, async_client, email="pdf_nokey@test.com"
    )

    with patch("app.api.v1.endpoints.import_transactions.settings") as mock_settings:
        mock_settings.AZURE_API_KEY = None

        response = await async_client.post(
            f"/api/v1/businesses/{biz_id}/transactions/import/parse",
            files={"file": ("statement.pdf", b"fake pdf content", "application/pdf")},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 503
    assert "AZURE_API_KEY" in response.json()["detail"]


# --- Tenant Isolation ---


@pytest.mark.asyncio
async def test_import_tenant_isolation(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Test that import respects business tenant boundaries."""
    # Create two businesses
    biz1_id, token1 = await _create_business_user_and_login(
        db_session, async_client, email="tenant1@test.com"
    )
    biz2_id, token2 = await _create_business_user_and_login(
        db_session, async_client, email="tenant2@test.com"
    )

    # Try to import into business 1 with token from business 2
    csv_content = (
        b"TRANS DATE,POSTING DATE,DESCRIPTION,AMOUNT ($)\n"
        b"Jan. 5,Jan. 6,INTUIT *QBooks Online,49.28\n"
    )

    response = await async_client.post(
        f"/api/v1/businesses/{biz1_id}/transactions/import/parse",
        files={"file": ("statement.csv", csv_content, "text/csv")},
        headers={"Authorization": f"Bearer {token2}"},
    )

    # Should get 403 from tenant isolation
    assert response.status_code == 403
