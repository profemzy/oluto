/**
 * API Types - TypeScript interfaces for all API requests and responses
 */

// ==================== Auth Types ====================

export interface LoginCredentials {
  username: string; // OAuth2 form uses 'username' for email
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: string;
}

export interface TokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  business_id: string | null;
}

// ==================== Business Types ====================

export interface BusinessCreate {
  name: string;
  province?: string;
  tax_profile?: string;
}

export interface BusinessResponse {
  id: string;
  name: string;
  province: string | null;
  timezone: string;
  tax_profile: string | null;
  created_at: string | null;
}

// ==================== Transaction Types ====================

export interface Transaction {
  id: string;
  vendor_name: string;
  amount: string;
  currency: string;
  description: string | null;
  transaction_date: string;
  category: string | null;
  classification: string | null;
  status: string;
  gst_amount: string;
  pst_amount: string;
  ai_confidence: number;
  ai_suggested_category: string | null;
  business_id: string;
  import_source: string | null;
  import_batch_id: string | null;
  reconciled: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface TransactionCreate {
  vendor_name: string;
  amount: string;
  currency?: string;
  description?: string;
  transaction_date: string;
  category?: string;
  classification?: string;
  source_device?: "web" | "mobile" | "voice";
  ai_suggested_category?: string;
  ai_confidence?: number;
  gst_amount?: string;
  pst_amount?: string;
}

export interface TransactionUpdate {
  vendor_name?: string;
  amount?: string;
  currency?: string;
  description?: string;
  transaction_date?: string;
  category?: string;
  classification?: string;
  status?: string;
  gst_amount?: string;
  pst_amount?: string;
}

export interface TransactionListParams {
  status?: string;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}

export interface StatusCounts {
  draft: number;
  processing: number;
  inbox_user: number;
  inbox_firm: number;
  ready: number;
  posted: number;
}

export interface DashboardSummary {
  total_revenue: string;
  total_expenses: string;
  tax_reserved: string;
  safe_to_spend: string;
  tax_collected: string;
  tax_itc: string;
  payments_received: string;
  outstanding_receivables: string;
  outstanding_payables: string;
  exceptions_count: number;
  transactions_count: number;
  status_counts: StatusCounts;
  recent_transactions: Transaction[];
  exceptions: Transaction[];
}

// ==================== Import Types ====================

export interface ParsedTransaction {
  row_index: number;
  transaction_date: string;
  vendor_name: string;
  amount: string;
  description?: string;
  account?: string;
  currency?: string;
  category?: string;
  classification?: string;
  ai_confidence?: number;
  is_duplicate?: boolean;
}

export interface ImportParseResponse {
  transactions: ParsedTransaction[];
  duplicates: number[];
  duplicate_count?: number;  // For backward compatibility
  warnings: string[];
  parse_warnings?: string[];  // For backward compatibility
  file_type?: string;  // For backward compatibility
  file_name?: string;  // For backward compatibility
  statement_period?: { start: string; end: string };  // For backward compatibility
  account_info?: string;  // For backward compatibility
  total_count?: number;  // For backward compatibility
}

export interface AsyncJobCreateResponse {
  job_id: number;
  status: string;
  message: string;
}

export interface ImportConfirmRequest {
  transactions: ParsedTransaction[];
  skip_duplicates: boolean;
}

export interface ImportConfirmResponse {
  import_batch_id: string;
  batch_id?: string;  // Alias for backward compatibility
  transactions_created: number;
  imported_count?: number;  // Alias for backward compatibility
  transactions_skipped: number;
  skipped_duplicates?: number;  // Alias for backward compatibility
}

export interface CategorySuggestRequest {
  description: string;
  amount?: string;
}

export interface CategorySuggestResponse {
  category: string;
  confidence: number;
  reasoning?: string;  // For backward compatibility
}

export interface BulkStatusUpdateRequest {
  transaction_ids: string[];
  status: string;
}

export interface BulkStatusUpdateResponse {
  updated: number;
  failed: number;
  transactions?: any[];  // For backward compatibility
}

export interface AsyncJobStatusResponse {
  job_id: number;
  status: string;
  progress: number;
  progress_message?: string;
  result?: ImportConfirmResponse;
  result_data?: any;  // For backward compatibility
  error?: string;
  error_message?: string;  // For backward compatibility
}

// ==================== Contact Types ====================

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billing_address?: string;
  shipping_address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  contact_type: "customer" | "vendor" | "employee";
  tax_number?: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ContactCreate {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  contact_type: "customer" | "vendor" | "employee";
  tax_number?: string;
}

export interface ContactUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  contact_type?: "customer" | "vendor" | "employee";
  tax_number?: string;
}

// ==================== Account Types ====================

export interface Account {
  id: string;
  name: string;
  account_type: string;
  account_subtype: string;
  code?: string;
  description?: string;
  is_active: boolean;
  parent_account_id?: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface AccountCreate {
  name: string;
  account_type: string;
  account_subtype: string;
  code?: string;
  description?: string;
}

export interface AccountUpdate {
  name?: string;
  account_type?: string;
  account_subtype?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
}

// ==================== Invoice Types ====================

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  status: string;
  invoice_date: string;
  due_date: string;
  total_amount: string;
  amount_due: string;
  balance: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface InvoiceLineItem {
  id?: string;
  line_number?: number;
  description?: string;  // Made optional for backward compatibility
  item_description?: string;
  quantity?: number;
  unit_price?: string;
  amount: string;
  gst_amount?: string;
  pst_amount?: string;
  discount_percent?: number;
  tax_code?: string;
  revenue_account_id?: string;
}

export interface InvoiceWithLineItems extends Invoice {
  line_items: InvoiceLineItem[];
  customer_memo?: string;
  billing_address?: string;
  shipping_address?: string;
  payment_method?: string;
}

export interface CreateInvoiceRequest {
  customer_id: string;
  invoice_date: string;
  due_date: string;
  line_items: InvoiceLineItem[];
  customer_memo?: string;
  billing_address?: string;
  shipping_address?: string;
}

export interface InvoiceListParams {
  status?: string;
  skip?: number;
  limit?: number;
}

// ==================== Bill Types ====================

export interface Bill {
  id: string;
  bill_number: string;
  vendor_id: string;
  vendor_name: string;
  status: string;
  bill_date: string;
  due_date: string;
  total_amount: string;
  amount_due: string;
  balance: string;
  memo?: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface BillLineItem {
  id?: string;
  line_number?: number;
  description: string;
  quantity?: number;
  unit_price?: string;
  amount: string;
  gst_amount?: string;
  pst_amount?: string;
  expense_account_id?: string;
}

export interface BillWithLineItems extends Bill {
  line_items: BillLineItem[];
}

export interface CreateBillRequest {
  vendor_id: string;
  bill_date: string;
  due_date: string;
  line_items: BillLineItem[];
  memo?: string;
}

export interface BillListParams {
  status?: string;
  skip?: number;
  limit?: number;
}

// Legacy type aliases for backward compatibility
export type CreateBillLineItemRequest = BillLineItem;
export type CreateInvoiceLineItemRequest = InvoiceLineItem;

// ==================== Payment Types ====================

export interface Payment {
  id: string;
  payment_number: string;
  customer_id: string;
  customer_name: string;
  amount: string;
  payment_date: string;
  method?: string;
  payment_method?: string;  // Alias for backward compatibility
  reference?: string;
  reference_number?: string;  // For backward compatibility
  memo?: string;  // For backward compatibility
  unapplied_amount?: string;  // For backward compatibility
  created_at: string | null;
  updated_at: string | null;
}

export interface CreatePaymentRequest {
  customer_id: string;
  amount: string;
  payment_date: string;
  method?: string;
  reference?: string;
  invoice_allocations?: { invoice_id: string; amount: string }[];
}

export interface ApplyPaymentRequest {
  invoice_allocations: { invoice_id: string; amount: string }[];
}

export interface PaymentListParams {
  skip?: number;
  limit?: number;
}

export interface BillPayment {
  id: string;
  payment_number: string;
  vendor_id: string;
  vendor_name: string;
  amount: string;
  payment_date: string;
  method?: string;
  reference?: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateBillPaymentRequest {
  vendor_id: string;
  amount: string;
  payment_date: string;
  method?: string;
  reference?: string;
  bill_allocations?: { bill_id: string; amount: string }[];
}

// ==================== Receipt Types ====================

export interface ReceiptOcrData {
  vendor_name: string;
  vendor?: string;  // Alias for backward compatibility
  amount: string;
  date: string;
  gst_amount?: string;
  pst_amount?: string;
  tax_amounts?: { gst: string; pst: string };
  raw_text?: string;
}

export interface ReceiptResponse {
  id: string;
  filename: string;
  original_filename?: string;
  content_type: string;
  size: number;
  file_size?: number;  // Alias for backward compatibility
  uploaded_at: string;
  ocr_data: ReceiptOcrData | null;
  ocr_status?: string;
  download_url?: string;  // Added for direct download URL
}

export interface ReceiptUploadResponse {
  receipt: ReceiptResponse;
  message?: string;
  ocr_data?: ReceiptOcrData | null;
}

export interface ReceiptDownloadResponse {
  url: string;
  download_url?: string;  // Alias for backward compatibility
  expires_at: string;
}

// ==================== Report Types ====================

export interface TrialBalance {
  as_of_date: string;
  accounts: {
    account_id: string;
    account_name: string;
    debit_balance: string;
    credit_balance: string;
  }[];
  entries?: any[];  // For backward compatibility
  total_debits?: string;  // For backward compatibility
  total_credits?: string;  // For backward compatibility
  is_balanced?: boolean;  // For backward compatibility
}

export interface ProfitLossStatement {
  start_date: string;
  end_date: string;
  period_start?: string;  // Alias for backward compatibility
  period_end?: string;  // Alias for backward compatibility
  income: {
    account_id: string;
    account_name: string;
    amount: string;
  }[];
  expenses: {
    account_id: string;
    account_name: string;
    amount: string;
  }[];
  net_income: string;
  revenue_entries?: any[];  // For backward compatibility
  expense_entries?: any[];  // For backward compatibility
  total_revenue?: string;  // For backward compatibility
  total_expenses?: string;  // For backward compatibility
}

// Type aliases for backward compatibility
export type BalanceSheetEntry = {
  account_id: string;
  account_name: string;
  amount: string;
};

export interface BalanceSheet {
  as_of_date: string;
  assets: {
    account_id: string;
    account_name: string;
    amount: string;
  }[];
  liabilities: {
    account_id: string;
    account_name: string;
    amount: string;
  }[];
  equity: {
    account_id: string;
    account_name: string;
    amount: string;
  }[];
  asset_entries?: any[];  // For backward compatibility
  liability_entries?: any[];  // For backward compatibility
  equity_entries?: any[];  // For backward compatibility
  total_assets?: string;  // For backward compatibility
  total_liabilities?: string;  // For backward compatibility
  total_equity?: string;  // For backward compatibility
}

export interface AccountsReceivableAging {
  as_of_date: string;
  customers: {
    customer_id: string;
    customer_name: string;
    current: string;
    days_30: string;
    days_60: string;
    days_90: string;
    total: string;
  }[];
  buckets?: {  // Alias for customers - for backward compatibility
    customer_id: string;
    customer_name: string;
    current: string;
    days_1_30: string;  // Note: different field name
    days_31_60: string;
    days_61_90: string;
    days_91_plus: string;
    total: string;
  }[];
}

// ==================== Reconciliation Types ====================

export interface ReconciliationSummary {
  account_id: string;
  account_name: string;
  statement_balance: string;
  ledger_balance: string;
  difference: string;
  reconciled_count: number;
  unreconciled_count: number;
  unreconciled?: number;  // Alias for backward compatibility
  reconciled?: number;  // Alias for backward compatibility
  suggested_matches?: number;  // For UI display
  total_transactions?: number;  // For backward compatibility
}

export interface ReconciliationSuggestion {
  transaction_id: string;
  transaction?: any;  // For backward compatibility
  statement_line_id: string;
  suggested_match?: any;  // For backward compatibility
  confidence: number;
  reason: string;
  match_reason?: string;  // For backward compatibility
  suggestion_id?: string;  // For backward compatibility
}

export interface ConfirmMatchRequest {
  transaction_id: string;
  statement_line_id: string;
}

export interface RejectMatchRequest {
  transaction_id: string;
  statement_line_id: string;
  reason?: string;
}

export interface UnlinkMatchRequest {
  reconciliation_id: string;
}

export interface AutoReconcileResponse {
  reconciled_count: number;
  total_attempted: number;
  suggestions_found?: number;  // For backward compatibility
}

export interface ManualReconcileRequest {
  transaction_ids: string[];
}

export interface ManualReconcileResponse {
  reconciled_count: number;
  updated_count?: number;  // For backward compatibility
}

export interface DuplicateGroup {
  transactions: Transaction[];
  reason: string;
  vendor_name?: string;  // For backward compatibility
  transaction_date?: string;  // For backward compatibility
  amount?: string;  // For backward compatibility
  count?: number;  // For backward compatibility
}

// ==================== Chat Types ====================

export interface Conversation {
  id: string;
  title: string;
  business_id: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "error";
  content: string;
  model?: string;
  created_at: string;
}

export interface SendChatResponse {
  success: boolean;
  message: string;
  response?: string;  // Alias for backward compatibility
  model?: string;
  error?: string;  // For error messages
  conversation_id?: string;
}

// ==================== QuickBooks Import Types ====================

export interface QbParsedAccount {
  account_name: string;
  name?: string;  // Alias for backward compatibility
  account_type: string;
  balance: string;
  conflict?: {  // For backward compatibility
    existing_account_id: string;
    existing_account_name: string;
    match_type: string;
    suggested_action?: string;  // For backward compatibility
  };
  mapped_type?: string;  // For backward compatibility
  suggested_code?: string;  // For backward compatibility
  existing_account_id?: string;  // For backward compatibility
  existing_account_name?: string;  // For backward compatibility
  match_type?: string;  // For backward compatibility
  suggested_action?: string;  // For backward compatibility
}

export interface QbParsedContact {
  name: string;
  type: string;
  email?: string;
  balance?: string;
}

export interface QbParsedJournalEntry {
  date: string;
  description: string;
  num?: string | number;  // For backward compatibility
  lines: {
    account_name: string;
    debit: string;
    credit: string;
  }[];
  is_balanced?: boolean;  // For backward compatibility
  total_debit?: string;  // For backward compatibility
  total_credit?: string;  // For backward compatibility
  suggested_classification?: string;  // For backward compatibility
  category_confidence?: number;  // For backward compatibility
  suggested_category?: string;  // For backward compatibility
  suggested_action?: string;  // For backward compatibility
}

export interface QbParsedInvoice {
  invoice_number?: string;
  date: string;
  due_date?: string;
  customer_name: string;
  description?: string;
  amount: string;
  account_name?: string;
  status?: string;
}

export interface QbParsedBill {
  bill_number?: string;
  date: string;
  due_date?: string;
  vendor_name: string;
  description?: string;
  amount: string;
  account_name?: string;
  status?: string;
}

export interface QbParsedPayment {
  payment_number?: string;
  date: string;
  contact_name: string;
  contact_type: string;
  amount: string;
  method?: string;
  applied_to?: string;
  deposit_account?: string;
}

export interface QbImportParseResponse {
  accounts: QbParsedAccount[];
  customers: QbParsedContact[];
  vendors: QbParsedContact[];
  journal_entries: QbParsedJournalEntry[];
  invoices: QbParsedInvoice[];
  bills: QbParsedBill[];
  payments: QbParsedPayment[];
  summary: Record<string, number>;
  warnings: string[];
}

export interface QbAccountConfirmItem {
  parsed_account: QbParsedAccount;
  action: "create_new" | "merge" | "skip";
  merge_with_account_id?: string;
}

export interface QbJournalCategory {
  index: number;
  category: string;
}

export interface QbImportConfirmRequest {
  accounts: QbAccountConfirmItem[];
  customers: QbParsedContact[];
  vendors: QbParsedContact[];
  journal_entries: QbParsedJournalEntry[];
  invoices: QbParsedInvoice[];
  bills: QbParsedBill[];
  payments: QbParsedPayment[];
  categories?: QbJournalCategory[];
}

export interface QbImportError {
  entity_type: string;
  entity_name: string;
  error: string;
}

export interface QbImportConfirmResponse {
  import_batch_id: string;
  accounts_created: number;
  accounts_merged: number;
  accounts_skipped: number;
  customers_created: number;
  vendors_created: number;
  journal_entries_created: number;
  invoices_created: number;
  bills_created: number;
  payments_created: number;
  errors: QbImportError[];
}
