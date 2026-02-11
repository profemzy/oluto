from decimal import Decimal

# Constants (2026 Rates)
# Using strings for Decimal initialization to avoid float precision errors
RATES = {
    "BC": {
        "GST": Decimal("0.05"),
        "PST": Decimal("0.07"),
        "HST": Decimal("0.00")
    },
    "ON": {
        "GST": Decimal("0.00"),
        "PST": Decimal("0.00"),
        "HST": Decimal("0.13")
    },
    "AB": {
        "GST": Decimal("0.05"),
        "PST": Decimal("0.00"),
        "HST": Decimal("0.00")
    }
}

class TaxBreakdown:
    def __init__(self, gst: Decimal, pst: Decimal, hst: Decimal, total_tax: Decimal):
        self.gst = gst
        self.pst = pst
        self.hst = hst
        self.total_tax = total_tax
    
    def to_dict(self):
        return {
            "gst": float(self.gst),
            "pst": float(self.pst),
            "hst": float(self.hst),
            "total_tax": float(self.total_tax)
        }

def calculate_tax_from_total(total_amount: Decimal, province: str = "BC") -> TaxBreakdown:
    """
    Reverse-calculates tax components from a gross total, assuming tax was included.
    Formula: Tax = Total - (Total / (1 + TaxRate))
    """
    rates = RATES.get(province, RATES["BC"])
    combined_rate = rates["GST"] + rates["PST"] + rates["HST"]
    
    # Calculate Net (Pre-Tax)
    net_amount = total_amount / (Decimal("1.00") + combined_rate)
    
    # Calculate Individual Components
    gst = net_amount * rates["GST"]
    pst = net_amount * rates["PST"]
    hst = net_amount * rates["HST"]
    
    # Rounding (CRA Standard: Half-up)
    # We round to 2 decimal places
    quantizer = Decimal("0.01")
    gst = gst.quantize(quantizer)
    pst = pst.quantize(quantizer)
    hst = hst.quantize(quantizer)
    
    total_tax = gst + pst + hst
    
    return TaxBreakdown(gst, pst, hst, total_tax)
