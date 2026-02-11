"""Unit tests for the AI categorizer service."""

import json
import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.ai_engine.categorizer import (
    CategorySuggestion,
    _apply_categories,
    _clamp_confidence,
    _parse_categorization_response,
    _validate_category,
    categorize_transactions_async,
    categorize_transactions_sync,
    suggest_category_async,
    is_ai_configured,
    _suggestion_cache,
)


# ---------------------------------------------------------------------------
# _validate_category
# ---------------------------------------------------------------------------


def test_validate_category_exact_match():
    assert _validate_category("Office expenses") == "Office expenses"


def test_validate_category_case_insensitive():
    assert _validate_category("office expenses") == "Office expenses"
    assert _validate_category("TRAVEL") == "Travel"


def test_validate_category_invalid():
    assert _validate_category("Unknown Category") == "Other expenses"
    assert _validate_category("") == "Other expenses"


# ---------------------------------------------------------------------------
# _clamp_confidence
# ---------------------------------------------------------------------------


def test_clamp_confidence_normal():
    assert _clamp_confidence(0.85) == 0.85


def test_clamp_confidence_clamped():
    assert _clamp_confidence(1.5) == 1.0
    assert _clamp_confidence(-0.3) == 0.0


def test_clamp_confidence_invalid():
    assert _clamp_confidence("not_a_number") == 0.0
    assert _clamp_confidence(None) == 0.0


# ---------------------------------------------------------------------------
# _parse_categorization_response
# ---------------------------------------------------------------------------


def test_parse_response_direct_array():
    raw = json.dumps([{"index": 0, "category": "Travel", "confidence": 0.9}])
    result = _parse_categorization_response(raw)
    assert len(result) == 1
    assert result[0]["category"] == "Travel"


def test_parse_response_wrapped_object():
    raw = json.dumps(
        {"results": [{"index": 0, "category": "Rent", "confidence": 0.8}]}
    )
    result = _parse_categorization_response(raw)
    assert len(result) == 1
    assert result[0]["category"] == "Rent"


def test_parse_response_invalid_json():
    result = _parse_categorization_response("not json at all")
    assert result == []


def test_parse_response_unexpected_format():
    result = _parse_categorization_response('{"foo": "bar"}')
    assert result == []


# ---------------------------------------------------------------------------
# _apply_categories
# ---------------------------------------------------------------------------


class FakeParsedTransaction:
    def __init__(self, vendor_name, amount, description=None):
        self.vendor_name = vendor_name
        self.amount = amount
        self.description = description
        self.category = None
        self.ai_confidence = 0.0


def test_apply_categories_valid():
    txns = [
        FakeParsedTransaction("Staples", Decimal("-50.00")),
        FakeParsedTransaction("Air Canada", Decimal("-300.00")),
    ]
    assignments = [
        {"index": 0, "category": "Office expenses", "confidence": 0.92},
        {"index": 1, "category": "Travel", "confidence": 0.88},
    ]
    result = _apply_categories(txns, assignments)
    assert result[0].category == "Office expenses"
    assert result[0].ai_confidence == 0.92
    assert result[1].category == "Travel"
    assert result[1].ai_confidence == 0.88


def test_apply_categories_invalid_category():
    txns = [FakeParsedTransaction("Mystery", Decimal("-10.00"))]
    assignments = [{"index": 0, "category": "Nonexistent", "confidence": 0.7}]
    result = _apply_categories(txns, assignments)
    assert result[0].category == "Other expenses"


def test_apply_categories_out_of_range_index():
    txns = [FakeParsedTransaction("Staples", Decimal("-50.00"))]
    assignments = [{"index": 5, "category": "Travel", "confidence": 0.9}]
    result = _apply_categories(txns, assignments)
    assert result[0].category is None  # Unchanged


def test_apply_categories_negative_index():
    txns = [FakeParsedTransaction("Staples", Decimal("-50.00"))]
    assignments = [{"index": -1, "category": "Travel", "confidence": 0.9}]
    result = _apply_categories(txns, assignments)
    assert result[0].category is None  # Unchanged


# ---------------------------------------------------------------------------
# is_ai_configured
# ---------------------------------------------------------------------------


def test_is_ai_configured_true():
    with patch("app.services.ai_engine.categorizer.settings") as mock_settings:
        mock_settings.FUELIX_API_KEY = "fake-key"
        assert is_ai_configured() is True


def test_is_ai_configured_false():
    with patch("app.services.ai_engine.categorizer.settings") as mock_settings:
        mock_settings.FUELIX_API_KEY = None
        assert is_ai_configured() is False


# ---------------------------------------------------------------------------
# categorize_transactions_async (mocked OpenAI)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_categorize_transactions_async_success():
    txns = [
        FakeParsedTransaction("Staples", Decimal("-50.00")),
        FakeParsedTransaction("Air Canada", Decimal("-300.00")),
    ]

    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content=json.dumps(
                    {
                        "results": [
                            {"index": 0, "category": "Office expenses", "confidence": 0.92},
                            {"index": 1, "category": "Travel", "confidence": 0.88},
                        ]
                    }
                )
            )
        )
    ]

    with patch("app.services.ai_engine.categorizer.settings") as mock_settings:
        mock_settings.FUELIX_API_KEY = "fake-key"
        mock_settings.FUELIX_BASE_URL = "https://test"
        mock_settings.FUELIX_MODEL = "test-model"

        with patch(
            "app.services.ai_engine.categorizer.AsyncOpenAI"
        ) as MockClient:
            mock_client = AsyncMock()
            mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
            MockClient.return_value = mock_client

            result = await categorize_transactions_async(txns)

    assert result[0].category == "Office expenses"
    assert result[0].ai_confidence == 0.92
    assert result[1].category == "Travel"


@pytest.mark.asyncio
async def test_categorize_transactions_async_api_error():
    txns = [FakeParsedTransaction("Staples", Decimal("-50.00"))]

    with patch("app.services.ai_engine.categorizer.settings") as mock_settings:
        mock_settings.FUELIX_API_KEY = "fake-key"
        mock_settings.FUELIX_BASE_URL = "https://test"
        mock_settings.FUELIX_MODEL = "test-model"

        with patch(
            "app.services.ai_engine.categorizer.AsyncOpenAI"
        ) as MockClient:
            mock_client = AsyncMock()
            mock_client.chat.completions.create = AsyncMock(
                side_effect=Exception("API connection error")
            )
            MockClient.return_value = mock_client

            result = await categorize_transactions_async(txns)

    # Should return unchanged (graceful degradation)
    assert result[0].category is None
    assert result[0].ai_confidence == 0.0


@pytest.mark.asyncio
async def test_categorize_transactions_async_empty_list():
    result = await categorize_transactions_async([])
    assert result == []


# ---------------------------------------------------------------------------
# categorize_transactions_sync (mocked OpenAI)
# ---------------------------------------------------------------------------


def test_categorize_transactions_sync_success():
    txns = [FakeParsedTransaction("Tim Hortons", Decimal("-12.50"))]

    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content=json.dumps(
                    {
                        "results": [
                            {"index": 0, "category": "Meals and entertainment", "confidence": 0.95},
                        ]
                    }
                )
            )
        )
    ]

    with patch("app.services.ai_engine.categorizer.settings") as mock_settings:
        mock_settings.FUELIX_API_KEY = "fake-key"
        mock_settings.FUELIX_BASE_URL = "https://test"
        mock_settings.FUELIX_MODEL = "test-model"

        with patch("app.services.ai_engine.categorizer.OpenAI") as MockClient:
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            MockClient.return_value = mock_client

            result = categorize_transactions_sync(txns)

    assert result[0].category == "Meals and entertainment"
    assert result[0].ai_confidence == 0.95


# ---------------------------------------------------------------------------
# suggest_category_async (mocked OpenAI)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_suggest_category_async_success():
    # Clear cache to ensure a fresh call
    _suggestion_cache.clear()

    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content=json.dumps(
                    {
                        "category": "Office expenses",
                        "confidence": 0.92,
                        "reasoning": "Staples is an office supply retailer",
                    }
                )
            )
        )
    ]

    with patch("app.services.ai_engine.categorizer.settings") as mock_settings:
        mock_settings.FUELIX_API_KEY = "fake-key"
        mock_settings.FUELIX_BASE_URL = "https://test"
        mock_settings.FUELIX_MODEL = "test-model"

        with patch(
            "app.services.ai_engine.categorizer.AsyncOpenAI"
        ) as MockClient:
            mock_client = AsyncMock()
            mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
            MockClient.return_value = mock_client

            result = await suggest_category_async("Staples")

    assert isinstance(result, CategorySuggestion)
    assert result.category == "Office expenses"
    assert result.confidence == 0.92
    assert result.reasoning == "Staples is an office supply retailer"

    _suggestion_cache.clear()


@pytest.mark.asyncio
async def test_suggest_category_async_uses_cache():
    _suggestion_cache.clear()

    # Populate cache manually (key format: "vendor|description")
    cached = CategorySuggestion(
        category="Travel",
        confidence=0.85,
        reasoning="cached",
    )
    _suggestion_cache["air canada|"] = cached

    # Should return cached result without calling OpenAI
    result = await suggest_category_async("Air Canada")
    assert result.category == "Travel"
    assert result.reasoning == "cached"

    _suggestion_cache.clear()


@pytest.mark.asyncio
async def test_suggest_category_async_cache_with_description():
    """Same vendor + same description should hit cache."""
    _suggestion_cache.clear()

    cached = CategorySuggestion(
        category="Office expenses",
        confidence=0.9,
        reasoning="cached with description",
    )
    _suggestion_cache["staples|ink cartridges for printer"] = cached

    result = await suggest_category_async("Staples", description="Ink cartridges for printer")
    assert result.category == "Office expenses"
    assert result.reasoning == "cached with description"

    _suggestion_cache.clear()


@pytest.mark.asyncio
async def test_suggest_category_async_description_cache_miss():
    """Same vendor but different description should miss cache and call LLM."""
    _suggestion_cache.clear()

    # Cache a vendor-only result
    cached = CategorySuggestion(
        category="Office expenses",
        confidence=0.8,
        reasoning="vendor only",
    )
    _suggestion_cache["staples|"] = cached

    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content=json.dumps(
                    {
                        "category": "Supplies",
                        "confidence": 0.95,
                        "reasoning": "Ink supplies for office printer",
                    }
                )
            )
        )
    ]

    with patch("app.services.ai_engine.categorizer.settings") as mock_settings:
        mock_settings.FUELIX_API_KEY = "fake-key"
        mock_settings.FUELIX_BASE_URL = "https://test"
        mock_settings.FUELIX_MODEL = "test-model"

        with patch(
            "app.services.ai_engine.categorizer.AsyncOpenAI"
        ) as MockClient:
            mock_client = AsyncMock()
            mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
            MockClient.return_value = mock_client

            # Same vendor, but now with description — should miss cache
            result = await suggest_category_async(
                "Staples", description="Ink cartridges for printer"
            )

    assert result.category == "Supplies"
    assert result.confidence == 0.95
    # The vendor-only cache entry should still exist
    assert "staples|" in _suggestion_cache
    # And the new description-specific entry should be cached too
    assert "staples|ink cartridges for printer" in _suggestion_cache

    _suggestion_cache.clear()


@pytest.mark.asyncio
async def test_suggest_category_async_api_error():
    _suggestion_cache.clear()

    with patch("app.services.ai_engine.categorizer.settings") as mock_settings:
        mock_settings.FUELIX_API_KEY = "fake-key"
        mock_settings.FUELIX_BASE_URL = "https://test"
        mock_settings.FUELIX_MODEL = "test-model"

        with patch(
            "app.services.ai_engine.categorizer.AsyncOpenAI"
        ) as MockClient:
            mock_client = AsyncMock()
            mock_client.chat.completions.create = AsyncMock(
                side_effect=Exception("timeout")
            )
            MockClient.return_value = mock_client

            result = await suggest_category_async("Some Vendor")

    assert result.category == "Other expenses"
    assert result.confidence == 0.0

    _suggestion_cache.clear()
