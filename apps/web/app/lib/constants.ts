/**
 * CRA T2125 expense categories used across the application.
 * Single source of truth — import from here instead of
 * duplicating the array in page components.
 */
export const CRA_CATEGORIES = [
  "Advertising",
  "Bad debts",
  "Business tax, fees, licences, dues, memberships",
  "Delivery, freight, and express",
  "Fuel costs",
  "Insurance",
  "Interest and bank charges",
  "Legal, accounting, and professional fees",
  "Management and administration fees",
  "Meals and entertainment",
  "Motor vehicle expenses",
  "Office expenses",
  "Prepaid expenses",
  "Property taxes",
  "Rent",
  "Repairs and maintenance",
  "Salaries, wages, and benefits",
  "Supplies",
  "Telephone and utilities",
  "Travel",
  "Other expenses",
] as const;

/**
 * Transaction classification options for bank statement imports.
 * Determines how a transaction affects financial calculations.
 */
export const CLASSIFICATION_OPTIONS = {
  credit: [
    { value: "business_income", label: "Business Income", description: "Revenue — counts toward income + tax collected" },
    { value: "transfer_in", label: "Transfer In", description: "Inter-account transfer — not revenue" },
    { value: "owner_contribution", label: "Owner Contribution", description: "Capital injection — equity, not revenue" },
    { value: "refund", label: "Refund", description: "Returns/rebates — not new revenue" },
    { value: "personal", label: "Personal", description: "Non-business — excluded from calculations" },
  ],
  debit: [
    { value: "business_expense", label: "Business Expense", description: "Deductible — counts toward expenses + ITCs" },
    { value: "transfer_out", label: "Transfer Out", description: "Inter-account transfer — not expense" },
    { value: "owner_draw", label: "Owner Draw", description: "Equity withdrawal — not deductible" },
    { value: "personal", label: "Personal", description: "Non-business — excluded from calculations" },
  ],
} as const;

/**
 * Receipt upload constraints — shared between validation and UI hints.
 */
export const RECEIPT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export const RECEIPT_ALLOWED_EXTENSIONS = ".jpg,.jpeg,.png,.pdf";

export const RECEIPT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
