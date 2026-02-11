"""
Transaction domain logic shared across endpoint modules.
"""

from decimal import Decimal

from app.logic.tax_canada import calculate_tax_from_total
from app.models.transaction import Transaction


def build_transaction(
    *,
    vendor_name: str,
    amount: Decimal,
    transaction_date,
    business_id: int,
    province: str,
    currency: str = "CAD",
    category: str | None = None,
    description: str | None = None,
    ai_suggested_category: str | None = None,
    ai_confidence: float | None = None,
    import_source: str | None = None,
    import_batch_id: str | None = None,
) -> Transaction:
    """
    Build a Transaction object with auto-calculated tax.

    Centralises the tax-calc + model-init logic used by both
    single-create and bulk-import endpoints.
    """
    tax = calculate_tax_from_total(amount, province)

    return Transaction(
        vendor_name=vendor_name,
        amount=amount,
        currency=currency,
        transaction_date=transaction_date,
        category=category,
        description=description,
        status="draft",
        gst_amount=tax.gst + tax.hst,
        pst_amount=tax.pst,
        ai_suggested_category=ai_suggested_category,
        ai_confidence=ai_confidence,
        business_id=business_id,
        import_source=import_source,
        import_batch_id=import_batch_id,
    )
