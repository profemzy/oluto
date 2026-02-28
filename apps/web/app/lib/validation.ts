/**
 * Zod Validation Schemas
 * 
 * Runtime validation for API responses to catch contract violations early.
 * Use these schemas to validate data at API boundaries.
 * 
 * These schemas mirror the TypeScript interfaces in api.ts for runtime validation.
 */

import { z } from "zod";

// ============================================================================
// Common Schemas
// ============================================================================

export const uuidSchema = z.string().uuid();

export const decimalStringSchema = z.string().regex(/^-?\d+\.?\d*$/, {
  message: "Must be a valid decimal number as string",
});

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Must be a valid date string (YYYY-MM-DD)",
});

export const dateTimeStringSchema = z.string().datetime();

// ============================================================================
// User & Auth Schemas
// ============================================================================

export const loginCredentialsSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerDataSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1, "Full name is required"),
  role: z.string().optional(),
});

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string(),
  role: z.string(),
  is_active: z.boolean(),
  business_id: z.string().nullable(),
});

// ============================================================================
// Business Schemas
// ============================================================================

export const businessResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  province: z.string().nullable(),
  timezone: z.string(),
  tax_profile: z.string().nullable(),
  created_at: z.string().nullable(),
});

// ============================================================================
// Transaction Schemas
// ============================================================================

export const transactionStatusSchema = z.enum([
  "draft",
  "processing",
  "inbox_user",
  "inbox_firm",
  "ready",
  "posted",
]);

export const transactionSchema = z.object({
  id: z.string(),
  vendor_name: z.string(),
  amount: decimalStringSchema,
  currency: z.string(),
  description: z.string().nullable(),
  transaction_date: z.string(),
  category: z.string().nullable(),
  classification: z.string().nullable(),
  status: z.string(),
  gst_amount: decimalStringSchema,
  pst_amount: decimalStringSchema,
  ai_confidence: z.number(),
  ai_suggested_category: z.string().nullable(),
  business_id: z.string(),
  import_source: z.string().nullable(),
  import_batch_id: z.string().nullable(),
  reconciled: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const transactionCreateSchema = z.object({
  vendor_name: z.string().min(1, "Vendor name is required"),
  amount: decimalStringSchema,
  currency: z.string().optional(),
  description: z.string().optional(),
  transaction_date: z.string(),
  category: z.string().optional(),
  classification: z.string().optional(),
  source_device: z.enum(["web", "mobile", "voice"]).optional(),
  ai_suggested_category: z.string().optional(),
  ai_confidence: z.number().optional(),
  gst_amount: decimalStringSchema.optional(),
  pst_amount: decimalStringSchema.optional(),
});

export const transactionUpdateSchema = z.object({
  vendor_name: z.string().optional(),
  amount: decimalStringSchema.optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  transaction_date: z.string().optional(),
  category: z.string().optional(),
  classification: z.string().optional(),
  status: z.string().optional(),
  gst_amount: decimalStringSchema.optional(),
  pst_amount: decimalStringSchema.optional(),
});

export const statusCountsSchema = z.object({
  draft: z.number(),
  processing: z.number(),
  inbox_user: z.number(),
  inbox_firm: z.number(),
  ready: z.number(),
  posted: z.number(),
});

// ============================================================================
// Dashboard Schemas
// ============================================================================

export const dashboardSummarySchema = z.object({
  total_revenue: decimalStringSchema,
  total_expenses: decimalStringSchema,
  tax_reserved: decimalStringSchema,
  safe_to_spend: decimalStringSchema,
  tax_collected: decimalStringSchema,
  tax_itc: decimalStringSchema,
  payments_received: decimalStringSchema,
  outstanding_receivables: decimalStringSchema,
  outstanding_payables: decimalStringSchema,
  exceptions_count: z.number(),
  transactions_count: z.number(),
  status_counts: statusCountsSchema,
  recent_transactions: z.array(transactionSchema),
  exceptions: z.array(transactionSchema),
});

// ============================================================================
// Import Schemas
// ============================================================================

export const parsedTransactionSchema = z.object({
  row_index: z.number(),
  transaction_date: z.string(),
  vendor_name: z.string(),
  amount: decimalStringSchema,
  description: z.string().nullable(),
  category: z.string().nullable(),
});

export const importParseResponseSchema = z.object({
  parsed: z.array(parsedTransactionSchema),
  row_count: z.number(),
  error: z.string().nullable(),
});

export const importTransactionItemSchema = z.object({
  transaction_date: z.string(),
  vendor_name: z.string(),
  amount: decimalStringSchema,
  description: z.string(),
  category: z.string().optional(),
});

export const importConfirmRequestSchema = z.object({
  business_id: z.string(),
  transactions: z.array(importTransactionItemSchema),
});

export const importConfirmResponseSchema = z.object({
  imported: z.number(),
  errors: z.array(z.string()),
});

// ============================================================================
// Bulk Operations Schemas
// ============================================================================

export const bulkStatusUpdateRequestSchema = z.object({
  transaction_ids: z.array(z.string()),
  status: transactionStatusSchema,
});

export const bulkStatusUpdateResponseSchema = z.object({
  updated: z.number(),
  errors: z.array(z.string()),
});

// ============================================================================
// Category Suggestion Schemas
// ============================================================================

export const categorySuggestResponseSchema = z.object({
  category: z.string(),
  confidence: z.number(),
  ai_suggested: z.boolean(),
});

// ============================================================================
// Contact Schemas
// ============================================================================

export const contactSchema = z.object({
  id: z.string(),
  business_id: z.string(),
  name: z.string(),
  contact_type: z.enum(["Customer", "Vendor", "Employee"]),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  postal_code: z.string().nullable(),
  country: z.string().nullable(),
  tax_number: z.string().nullable(),
  is_customer: z.boolean(),
  is_vendor: z.boolean(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const contactCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact_type: z.enum(["Customer", "Vendor", "Employee"]),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  tax_number: z.string().optional(),
});

export const contactUpdateSchema = contactCreateSchema.partial();

// ============================================================================
// Account Schemas
// ============================================================================

export const accountSchema = z.object({
  id: z.string(),
  business_id: z.string(),
  code: z.string(),
  name: z.string(),
  account_type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  parent_id: z.string().nullable(),
  is_bank_account: z.boolean(),
  is_active: z.boolean(),
  description: z.string().nullable(),
  opening_balance: decimalStringSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const accountCreateSchema = z.object({
  code: z.string(),
  name: z.string().min(1, "Name is required"),
  account_type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  parent_id: z.string().optional(),
  is_bank_account: z.boolean().optional(),
  description: z.string().optional(),
  opening_balance: decimalStringSchema.optional(),
});

export const accountUpdateSchema = accountCreateSchema.partial();

// ============================================================================
// Report Schemas
// ============================================================================

export const trialBalanceEntrySchema = z.object({
  account_id: z.string(),
  account_code: z.string(),
  account_name: z.string(),
  account_type: z.string(),
  debit: decimalStringSchema,
  credit: decimalStringSchema,
});

export const trialBalanceSchema = z.object({
  as_of_date: z.string(),
  entries: z.array(trialBalanceEntrySchema),
  total_debits: decimalStringSchema,
  total_credits: decimalStringSchema,
});

export const profitLossEntrySchema = z.object({
  account_id: z.string(),
  account_code: z.string(),
  account_name: z.string(),
  amount: decimalStringSchema,
});

export const profitLossStatementSchema = z.object({
  period_start: z.string(),
  period_end: z.string(),
  revenue_entries: z.array(profitLossEntrySchema),
  expense_entries: z.array(profitLossEntrySchema),
  total_revenue: decimalStringSchema,
  total_expenses: decimalStringSchema,
  net_income: decimalStringSchema,
});

export const balanceSheetEntrySchema = z.object({
  account_id: z.string(),
  account_code: z.string(),
  account_name: z.string(),
  balance: decimalStringSchema,
});

export const balanceSheetSchema = z.object({
  as_of_date: z.string(),
  asset_entries: z.array(balanceSheetEntrySchema),
  liability_entries: z.array(balanceSheetEntrySchema),
  equity_entries: z.array(balanceSheetEntrySchema),
  total_assets: decimalStringSchema,
  total_liabilities: decimalStringSchema,
  total_equity: decimalStringSchema,
});

export const agingBucketSchema = z.object({
  label: z.string(),
  days_min: z.number(),
  days_max: z.number().nullable(),
  amount: decimalStringSchema,
});

export const agingTotalsSchema = z.object({
  current: z.number(),
  days_1_30: z.number(),
  days_31_60: z.number(),
  days_61_90: z.number(),
  days_91_plus: z.number(),
  total: z.number(),
});

export const accountsReceivableAgingSchema = z.object({
  as_of_date: z.string(),
  customer_id: z.string().nullable(),
  customer_name: z.string().nullable(),
  current: decimalStringSchema,
  days_1_30: decimalStringSchema,
  days_31_60: decimalStringSchema,
  days_61_90: decimalStringSchema,
  days_91_plus: decimalStringSchema,
  total_outstanding: decimalStringSchema,
  buckets: z.record(z.string(), decimalStringSchema),
});

// ============================================================================
// Invoice Schemas
// ============================================================================

export const invoiceLineItemSchema = z.object({
  id: z.string(),
  invoice_id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unit_price: decimalStringSchema,
  amount: decimalStringSchema,
  tax_amount: decimalStringSchema,
});

export const invoiceSchema = z.object({
  id: z.string(),
  business_id: z.string(),
  contact_id: z.string(),
  invoice_number: z.string(),
  issue_date: z.string(),
  due_date: z.string(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  subtotal: decimalStringSchema,
  tax_amount: decimalStringSchema,
  total: decimalStringSchema,
  amount_paid: decimalStringSchema,
  balance: decimalStringSchema,
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const invoiceWithLineItemsSchema = invoiceSchema.extend({
  line_items: z.array(invoiceLineItemSchema),
});

// ============================================================================
// Bill Schemas
// ============================================================================

export const billLineItemSchema = z.object({
  id: z.string(),
  bill_id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unit_price: decimalStringSchema,
  amount: decimalStringSchema,
  tax_amount: decimalStringSchema,
});

export const billSchema = z.object({
  id: z.string(),
  business_id: z.string(),
  contact_id: z.string(),
  bill_number: z.string(),
  issue_date: z.string(),
  due_date: z.string(),
  status: z.enum(["draft", "received", "paid", "overdue", "cancelled"]),
  subtotal: decimalStringSchema,
  tax_amount: decimalStringSchema,
  total: decimalStringSchema,
  amount_paid: decimalStringSchema,
  balance: decimalStringSchema,
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ============================================================================
// Payment Schemas
// ============================================================================

export const paymentSchema = z.object({
  id: z.string(),
  business_id: z.string(),
  contact_id: z.string(),
  payment_date: z.string(),
  amount: decimalStringSchema,
  payment_method: z.enum(["cash", "check", "credit_card", "debit_card", "bank_transfer", "other"]),
  reference_number: z.string().nullable(),
  memo: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ============================================================================
// Reconciliation Schemas
// ============================================================================

export const reconciliationSummarySchema = z.object({
  total_transactions: z.number(),
  reconciled: z.number(),
  unreconciled: z.number(),
  suggested_matches: z.number(),
});

export const reconciliationMatchSchema = z.object({
  transaction_id: z.string(),
  matched_transaction_id: z.string(),
  confidence: z.number(),
  reason: z.string(),
});

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates data against a Zod schema
 * Throws an error with detailed message if validation fails
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "root"}: ${issue.message}`
    );
    throw new Error(`API response validation failed: ${issues.join("; ")}`);
  }
  
  return result.data;
}

/**
 * Validates data against a Zod schema
 * Returns null if validation fails (silent validation for non-critical paths)
 */
export function validateDataSilent<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Type guard that validates and narrows type
 */
export function isValidData<T>(schema: z.ZodSchema<T>, data: unknown): data is T {
  return schema.safeParse(data).success;
}

/**
 * Validates an array of items against a schema
 * Useful for list endpoints
 */
export function validateArray<T>(schema: z.ZodSchema<T>, data: unknown[]): T[] {
  return data.map((item, index) => {
    try {
      return validateData(schema, item);
    } catch (error) {
      throw new Error(`Item at index ${index}: ${error instanceof Error ? error.message : "Invalid data"}`);
    }
  });
}

// ============================================================================
// Type Exports (for convenience)
// ============================================================================

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type RegisterData = z.infer<typeof registerDataSchema>;
export type User = z.infer<typeof userSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionCreate = z.infer<typeof transactionCreateSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type Account = z.infer<typeof accountSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type Bill = z.infer<typeof billSchema>;
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
