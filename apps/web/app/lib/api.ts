const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// --- Auth Types ---

export interface LoginCredentials {
  username: string;  // OAuth2 form uses 'username' for email
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  business_id: string | null;
}

// --- Business Types ---

export interface BusinessCreate {
  name: string;
  province?: string;
  tax_profile?: string;
}

export interface BusinessResponse {
  id: string;
  name: string;
  province: string | null;
  tax_profile: string | null;
  created_at: string | null;
}

// --- Transaction Types ---

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
  /** Override GST/HST amount (from receipt). If omitted, auto-calculated from province. */
  gst_amount?: string;
  /** Override PST/QST amount (from receipt). If omitted, auto-calculated from province. */
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
  /** Override GST/HST amount (from receipt). */
  gst_amount?: string;
  /** Override PST/QST amount (from receipt). */
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
  /** GST/HST collected on income (sales tax liability) */
  tax_collected: string;
  /** Input Tax Credits: GST/HST paid on expenses (reduces CRA obligation) */
  tax_itc: string;
  /** Customer payments received via invoices */
  payments_received: string;
  /** Total unpaid invoice balances owed to the business */
  outstanding_receivables: string;
  /** Total unpaid bill balances the business owes */
  outstanding_payables: string;
  exceptions_count: number;
  transactions_count: number;
  status_counts: StatusCounts;
  recent_transactions: Transaction[];
  exceptions: Transaction[];
}

// --- Import Types ---

export interface ParsedTransaction {
  row_index: number;
  transaction_date: string;
  vendor_name: string;
  amount: string;
  description: string | null;
  category: string | null;
  classification: string | null;
  ai_confidence: number;
  is_duplicate: boolean;
  duplicate_transaction_id: string | null;
}

export interface ImportParseResponse {
  file_type: "csv" | "pdf";
  file_name: string;
  statement_period: string | null;
  account_info: string | null;
  transactions: ParsedTransaction[];
  total_count: number;
  duplicate_count: number;
  parse_warnings: string[];
}

export interface ImportTransactionItem {
  transaction_date: string;
  vendor_name: string;
  amount: string;
  description?: string;
  category?: string;
  classification?: string;
  ai_suggested_category?: string;
  ai_confidence?: number;
}

export interface ImportConfirmRequest {
  file_type: "csv" | "pdf";
  transactions: ImportTransactionItem[];
}

export interface ImportConfirmResponse {
  imported_count: number;
  skipped_duplicates: number;
  batch_id: string;
  transactions: Transaction[];
}

// --- Bulk Status Types ---

export interface BulkStatusUpdateRequest {
  transaction_ids?: string[];
  batch_id?: string;
  status: string;
}

export interface BulkStatusUpdateResponse {
  updated_count: number;
  transactions: Transaction[];
}

// --- Category Suggestion Types ---

export interface CategorySuggestRequest {
  vendor_name: string;
  amount?: string;
  description?: string;
}

export interface CategorySuggestResponse {
  category: string;
  confidence: number;
  reasoning: string | null;
}

// --- Contact Types ---

export interface Contact {
  id: string;
  contact_type: "Customer" | "Vendor" | "Employee";
  name: string;
  email: string | null;
  phone: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactCreate {
  contact_type: "Customer" | "Vendor" | "Employee";
  name: string;
  email?: string;
  phone?: string;
  billing_address?: string;
  shipping_address?: string;
}

export interface ContactUpdate {
  name?: string;
  email?: string;
  phone?: string;
  billing_address?: string;
  shipping_address?: string;
}

// --- Account Types ---

export interface Account {
  id: string;
  code: string;
  name: string;
  account_type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  parent_account_id: string | null;
  is_active: boolean;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountCreate {
  code: string;
  name: string;
  account_type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  parent_account_id?: string;
}

export interface AccountUpdate {
  name?: string;
  is_active?: boolean;
}

// --- Report Types ---

export interface TrialBalanceEntry {
  account_id: string;
  code: string;
  name: string;
  account_type: string;
  debit_balance: string;
  credit_balance: string;
  net_balance: string;
}

export interface TrialBalance {
  as_of_date: string;
  entries: TrialBalanceEntry[];
  total_debits: string;
  total_credits: string;
  is_balanced: boolean;
}

export interface ProfitLossStatement {
  start_date: string;
  end_date: string;
  revenue: { accounts: TrialBalanceEntry[]; total: string };
  expenses: { accounts: TrialBalanceEntry[]; total: string };
  net_income: string;
}

export interface BalanceSheet {
  as_of_date: string;
  assets: { accounts: TrialBalanceEntry[]; total: string };
  liabilities: { accounts: TrialBalanceEntry[]; total: string };
  equity: { accounts: TrialBalanceEntry[]; total: string };
  is_balanced: boolean;
}

export interface AgingBucket {
  customer_id: string;
  customer_name: string;
  current: string;
  days_1_30: string;
  days_31_60: string;
  days_61_90: string;
  days_91_plus: string;
  total: string;
}

export interface AgingTotals {
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  days_91_plus: number;
  total: number;
}

export interface AccountsReceivableAging {
  as_of_date: string;
  total_outstanding: string;
  buckets: AgingBucket[];
}

/** Compute aggregate totals from AR aging buckets */
export function computeAgingTotals(aging: AccountsReceivableAging): AgingTotals {
  const t: AgingTotals = { current: 0, days_1_30: 0, days_31_60: 0, days_61_90: 0, days_91_plus: 0, total: 0 };
  for (const b of aging.buckets) {
    t.current += parseFloat(b.current) || 0;
    t.days_1_30 += parseFloat(b.days_1_30) || 0;
    t.days_31_60 += parseFloat(b.days_31_60) || 0;
    t.days_61_90 += parseFloat(b.days_61_90) || 0;
    t.days_91_plus += parseFloat(b.days_91_plus) || 0;
    t.total += parseFloat(b.total) || 0;
  }
  return t;
}

// --- Invoice Types ---

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  ship_date: string | null;
  tracking_number: string | null;
  total_amount: string;
  balance: string;
  status: "draft" | "sent" | "paid" | "partial" | "overdue" | "void";
  customer_memo: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  line_number: number;
  item_description: string;
  quantity: string;
  unit_price: string;
  amount: string;
  discount_percent: string | null;
  discount_amount: string | null;
  tax_code: string | null;
  revenue_account_id: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithLineItems extends Invoice {
  line_items: InvoiceLineItem[];
}

export interface CreateInvoiceLineItemRequest {
  line_number: number;
  item_description: string;
  quantity: string;
  unit_price: string;
  discount_percent?: string;
  tax_code?: string;
  revenue_account_id: string;
}

export interface CreateInvoiceRequest {
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  ship_date?: string;
  customer_memo?: string;
  billing_address?: string;
  shipping_address?: string;
  company_id?: string;
  line_items: CreateInvoiceLineItemRequest[];
}

export interface InvoiceListParams {
  customer_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

// --- Bill Types ---

export interface Bill {
  id: string;
  bill_number: string | null;
  vendor_id: string;
  bill_date: string;
  due_date: string;
  total_amount: string;
  balance: string;
  status: "open" | "paid" | "partial" | "void";
  memo: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillLineItem {
  id: string;
  bill_id: string;
  line_number: number;
  description: string | null;
  amount: string;
  expense_account_id: string;
  billable: boolean | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillWithLineItems extends Bill {
  line_items: BillLineItem[];
}

export interface CreateBillLineItemRequest {
  line_number: number;
  description?: string;
  amount: string;
  expense_account_id: string;
  billable?: boolean;
  customer_id?: string;
}

export interface CreateBillRequest {
  bill_number?: string;
  vendor_id: string;
  bill_date: string;
  due_date: string;
  memo?: string;
  company_id?: string;
  line_items: CreateBillLineItemRequest[];
}

export interface BillListParams {
  vendor_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

// --- Payment Types ---

export interface Payment {
  id: string;
  payment_number: string | null;
  customer_id: string;
  payment_date: string;
  amount: string;
  unapplied_amount: string | null;
  payment_method: string;
  reference_number: string | null;
  deposit_to_account_id: string | null;
  memo: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentApplication {
  id: string;
  payment_id: string;
  invoice_id: string;
  amount_applied: string;
  created_at: string;
}

export interface CreatePaymentApplicationRequest {
  invoice_id: string;
  amount_applied: string;
}

export interface CreatePaymentRequest {
  payment_number?: string;
  customer_id: string;
  payment_date: string;
  amount: string;
  payment_method: string;
  reference_number?: string;
  deposit_to_account_id?: string;
  memo?: string;
  company_id?: string;
  applications: CreatePaymentApplicationRequest[];
}

export interface PaymentListParams {
  customer_id?: string;
  unapplied_only?: boolean;
  limit?: number;
  offset?: number;
}

export interface ApplyPaymentRequest {
  applications: CreatePaymentApplicationRequest[];
}

// --- Bill Payment Types ---

export interface BillPayment {
  id: string;
  payment_number: string | null;
  vendor_id: string;
  payment_date: string;
  amount: string;
  payment_method: string;
  reference_number: string | null;
  bank_account_id: string | null;
  memo: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillPaymentApplication {
  id: string;
  bill_payment_id: string;
  bill_id: string;
  amount_applied: string;
  created_at: string;
}

export interface CreateBillPaymentApplicationRequest {
  bill_id: string;
  amount_applied: string;
}

export interface CreateBillPaymentRequest {
  payment_number?: string;
  vendor_id: string;
  payment_date: string;
  amount: string;
  payment_method: string;
  reference_number?: string;
  bank_account_id?: string;
  memo?: string;
  company_id?: string;
  applications: CreateBillPaymentApplicationRequest[];
}

// --- Async Job Types ---

export interface AsyncJobCreateResponse {
  job_id: number;
  celery_task_id: string;
  status: string;
  message: string;
}

export interface AsyncJobStatusResponse {
  job_id: number;
  celery_task_id: string;
  job_type: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  progress_message: string | null;
  result_data: ImportParseResponse | null;
  error_message: string | null;
  retry_count: number;
  created_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}

// --- Reconciliation Types ---

export interface ReconciliationSummary {
  total_transactions: number;
  reconciled: number;
  unreconciled: number;
  suggested_matches: number;
}

export interface SuggestedMatch {
  match_type: "payment" | "bill_payment";
  match_id: string;
  amount: string;
  date: string;
  reference: string;
  counterparty: string;
}

export interface ReconciliationSuggestion {
  suggestion_id: string;
  transaction: Transaction;
  suggested_match: SuggestedMatch;
  confidence: string;
  match_reason: string;
}

export interface ConfirmMatchRequest {
  transaction_id: string;
  match_id: string;
  match_type: "payment" | "bill_payment";
}

export interface RejectMatchRequest {
  suggestion_id: string;
}

export interface UnlinkMatchRequest {
  transaction_id: string;
}

export interface AutoReconcileRequest {
  min_confidence?: number;
}

export interface AutoReconcileResponse {
  suggestions_found: number;
}

export interface ManualReconcileRequest {
  transaction_ids: string[];
}

export interface ManualReconcileResponse {
  updated_count: number;
}

export interface DuplicateGroup {
  transaction_date: string;
  vendor_name: string;
  amount: string;
  count: number;
  transactions: Transaction[];
}

// --- Receipt Types ---

export interface ReceiptOcrData {
  vendor?: string;
  amount?: string;
  date?: string;
  tax_amounts?: { gst?: string; pst?: string };
  raw_text?: string;
}

export interface ReceiptResponse {
  id: string;
  transaction_id: string;
  business_id: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  ocr_status: "none" | "pending" | "completed" | "failed";
  ocr_data: ReceiptOcrData | null;
  created_at: string;
  updated_at: string;
}

export interface ReceiptUploadResponse {
  receipt: ReceiptResponse;
  ocr_data: ReceiptOcrData | null;
}

export interface ReceiptDownloadResponse {
  download_url: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.error || error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    const json = await response.json();
    // LedgerForge wraps responses in { success, data } — unwrap if present
    return json.data !== undefined ? json.data : json;
  }

  private async uploadRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    // Add auth token (do NOT set Content-Type — browser sets it with boundary)
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "An error occurred" }));
      throw new Error(
        error.error || error.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const json = await response.json();
    return json.data !== undefined ? json.data : json;
  }

  // --- Auth endpoints ---

  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    // OAuth2 form data format
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Invalid credentials" }));
      throw new Error(error.error || error.detail || "Login failed");
    }

    const json = await response.json();
    // LedgerForge wraps responses in { success, data }
    return json.data !== undefined ? json.data : json;
  }

  async register(data: RegisterData): Promise<User> {
    return this.request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  // --- Token management ---

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // --- Business endpoints ---

  async createBusiness(data: BusinessCreate): Promise<BusinessResponse> {
    return this.request<BusinessResponse>("/businesses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listBusinesses(): Promise<BusinessResponse[]> {
    return this.request<BusinessResponse[]>("/businesses");
  }

  async getBusiness(businessId: string): Promise<BusinessResponse> {
    return this.request<BusinessResponse>(`/businesses/${businessId}`);
  }

  async updateBusiness(businessId: string, data: Partial<BusinessCreate>): Promise<BusinessResponse> {
    return this.request<BusinessResponse>(`/businesses/${businessId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // --- Transaction endpoints ---

  async createTransaction(businessId: string, data: TransactionCreate): Promise<Transaction> {
    return this.request<Transaction>(`/businesses/${businessId}/transactions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listTransactions(businessId: string, params?: TransactionListParams): Promise<Transaction[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.start_date) searchParams.set("start_date", params.start_date);
    if (params?.end_date) searchParams.set("end_date", params.end_date);
    if (params?.skip !== undefined) searchParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const path = `/businesses/${businessId}/transactions${qs ? `?${qs}` : ""}`;
    return this.request<Transaction[]>(path);
  }

  async getTransaction(businessId: string, transactionId: string): Promise<Transaction> {
    return this.request<Transaction>(`/businesses/${businessId}/transactions/${transactionId}`);
  }

  async updateTransaction(businessId: string, transactionId: string, data: TransactionUpdate): Promise<Transaction> {
    return this.request<Transaction>(`/businesses/${businessId}/transactions/${transactionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(businessId: string, transactionId: string): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/transactions/${transactionId}`, {
      method: "DELETE",
    });
  }

  // --- Dashboard endpoints ---

  async getDashboardSummary(businessId: string): Promise<DashboardSummary> {
    return this.request<DashboardSummary>(`/businesses/${businessId}/transactions/summary`);
  }

  // --- Import endpoints ---

  async parseImportFile(
    businessId: string,
    file: File
  ): Promise<ImportParseResponse | AsyncJobCreateResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return this.uploadRequest<ImportParseResponse | AsyncJobCreateResponse>(
      `/businesses/${businessId}/transactions/import/parse`,
      formData
    );
  }

  async confirmImport(
    businessId: string,
    data: ImportConfirmRequest
  ): Promise<ImportConfirmResponse> {
    return this.request<ImportConfirmResponse>(
      `/businesses/${businessId}/transactions/import/confirm`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  // --- Category Suggestion endpoints ---

  async suggestCategory(
    businessId: string,
    data: CategorySuggestRequest
  ): Promise<CategorySuggestResponse> {
    return this.request<CategorySuggestResponse>(
      `/businesses/${businessId}/transactions/suggest-category`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  // --- Bulk Status endpoints ---

  async bulkUpdateStatus(
    businessId: string,
    data: BulkStatusUpdateRequest
  ): Promise<BulkStatusUpdateResponse> {
    return this.request<BulkStatusUpdateResponse>(
      `/businesses/${businessId}/transactions/bulk-status`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }

  // --- Async Job endpoints ---

  async getJobStatus(
    businessId: string,
    jobId: number
  ): Promise<AsyncJobStatusResponse> {
    return this.request<AsyncJobStatusResponse>(
      `/businesses/${businessId}/transactions/jobs/${jobId}`
    );
  }

  // --- Contact endpoints ---

  async listContacts(): Promise<Contact[]> {
    return this.request<Contact[]>("/contacts");
  }

  async getCustomers(): Promise<Contact[]> {
    return this.request<Contact[]>("/contacts/customers");
  }

  async getVendors(): Promise<Contact[]> {
    return this.request<Contact[]>("/contacts/vendors");
  }

  async getEmployees(): Promise<Contact[]> {
    return this.request<Contact[]>("/contacts/employees");
  }

  async getContact(contactId: string): Promise<Contact> {
    return this.request<Contact>(`/contacts/${contactId}`);
  }

  async createContact(data: ContactCreate): Promise<Contact> {
    return this.request<Contact>("/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateContact(contactId: string, data: ContactUpdate): Promise<Contact> {
    return this.request<Contact>(`/contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.request<Record<string, never>>(`/contacts/${contactId}`, {
      method: "DELETE",
    });
  }

  // --- Account endpoints ---

  async listAccounts(): Promise<Account[]> {
    return this.request<Account[]>("/accounts");
  }

  async getAccount(accountId: string): Promise<Account> {
    return this.request<Account>(`/accounts/${accountId}`);
  }

  async createAccount(data: AccountCreate): Promise<Account> {
    return this.request<Account>("/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAccount(accountId: string, data: AccountUpdate): Promise<Account> {
    return this.request<Account>(`/accounts/${accountId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deactivateAccount(accountId: string): Promise<void> {
    await this.request<Record<string, never>>(`/accounts/${accountId}`, {
      method: "DELETE",
    });
  }

  // --- Invoice endpoints ---

  async listInvoices(params?: InvoiceListParams): Promise<Invoice[]> {
    const searchParams = new URLSearchParams();
    if (params?.customer_id) searchParams.set("customer_id", params.customer_id);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
    const qs = searchParams.toString();
    return this.request<Invoice[]>(`/invoices${qs ? `?${qs}` : ""}`);
  }

  async getInvoice(invoiceId: string): Promise<InvoiceWithLineItems> {
    return this.request<InvoiceWithLineItems>(`/invoices/${invoiceId}`);
  }

  async createInvoice(data: CreateInvoiceRequest): Promise<InvoiceWithLineItems> {
    return this.request<InvoiceWithLineItems>("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateInvoiceStatus(invoiceId: string, status: string): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${invoiceId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return this.request<Invoice[]>("/invoices/overdue");
  }

  async getCustomerInvoices(customerId: string): Promise<Invoice[]> {
    return this.request<Invoice[]>(`/customers/${customerId}/invoices`);
  }

  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    return this.request<Payment[]>(`/invoices/${invoiceId}/payments`);
  }

  // --- Bill endpoints ---

  async listBills(params?: BillListParams): Promise<Bill[]> {
    const searchParams = new URLSearchParams();
    if (params?.vendor_id) searchParams.set("vendor_id", params.vendor_id);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
    const qs = searchParams.toString();
    return this.request<Bill[]>(`/bills${qs ? `?${qs}` : ""}`);
  }

  async getBill(billId: string): Promise<BillWithLineItems> {
    return this.request<BillWithLineItems>(`/bills/${billId}`);
  }

  async createBill(data: CreateBillRequest): Promise<Bill> {
    return this.request<Bill>("/bills", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBillStatus(billId: string, status: string): Promise<Bill> {
    return this.request<Bill>(`/bills/${billId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async deleteBill(billId: string): Promise<void> {
    await this.request<Record<string, never>>(`/bills/${billId}`, {
      method: "DELETE",
    });
  }

  async getOverdueBills(): Promise<Bill[]> {
    return this.request<Bill[]>("/bills/overdue");
  }

  async getVendorBills(vendorId: string): Promise<Bill[]> {
    return this.request<Bill[]>(`/vendors/${vendorId}/bills`);
  }

  // --- Payment endpoints ---

  async listPayments(params?: PaymentListParams): Promise<Payment[]> {
    const searchParams = new URLSearchParams();
    if (params?.customer_id) searchParams.set("customer_id", params.customer_id);
    if (params?.unapplied_only) searchParams.set("unapplied_only", "true");
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
    const qs = searchParams.toString();
    return this.request<Payment[]>(`/payments${qs ? `?${qs}` : ""}`);
  }

  async getPayment(paymentId: string): Promise<Payment> {
    return this.request<Payment>(`/payments/${paymentId}`);
  }

  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    return this.request<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async applyPayment(paymentId: string, data: ApplyPaymentRequest): Promise<void> {
    await this.request<Record<string, never>>(`/payments/${paymentId}/apply`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getUnappliedPayments(customerId?: string): Promise<Payment[]> {
    const qs = customerId ? `?customer_id=${customerId}` : "";
    return this.request<Payment[]>(`/payments/unapplied${qs}`);
  }

  // --- Bill Payment endpoints ---

  async createBillPayment(data: CreateBillPaymentRequest): Promise<BillPayment> {
    return this.request<BillPayment>("/bill-payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // --- Receipt endpoints ---

  async uploadReceipt(
    businessId: string,
    transactionId: string,
    file: File,
    runOcr: boolean = false
  ): Promise<ReceiptUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    if (runOcr) {
      formData.append("run_ocr", "true");
    }
    return this.uploadRequest<ReceiptUploadResponse>(
      `/businesses/${businessId}/transactions/${transactionId}/receipts`,
      formData
    );
  }

  async listReceipts(
    businessId: string,
    transactionId: string
  ): Promise<ReceiptResponse[]> {
    return this.request<ReceiptResponse[]>(
      `/businesses/${businessId}/transactions/${transactionId}/receipts`
    );
  }

  async getReceipt(
    businessId: string,
    receiptId: string
  ): Promise<ReceiptResponse> {
    return this.request<ReceiptResponse>(
      `/businesses/${businessId}/receipts/${receiptId}`
    );
  }

  async deleteReceipt(
    businessId: string,
    receiptId: string
  ): Promise<void> {
    await this.request<Record<string, never>>(
      `/businesses/${businessId}/receipts/${receiptId}`,
      { method: "DELETE" }
    );
  }

  async getReceiptDownloadUrl(
    businessId: string,
    receiptId: string
  ): Promise<ReceiptDownloadResponse> {
    return this.request<ReceiptDownloadResponse>(
      `/businesses/${businessId}/receipts/${receiptId}/download`
    );
  }

  // --- Report endpoints ---

  async getTrialBalance(asOfDate?: string): Promise<TrialBalance> {
    const qs = asOfDate ? `?as_of_date=${asOfDate}` : "";
    return this.request<TrialBalance>(`/reports/trial-balance${qs}`);
  }

  async getProfitLoss(startDate?: string, endDate?: string): Promise<ProfitLossStatement> {
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    const qs = params.toString();
    return this.request<ProfitLossStatement>(`/reports/profit-loss${qs ? `?${qs}` : ""}`);
  }

  async getBalanceSheet(asOfDate?: string): Promise<BalanceSheet> {
    const qs = asOfDate ? `?as_of_date=${asOfDate}` : "";
    return this.request<BalanceSheet>(`/reports/balance-sheet${qs}`);
  }

  async getArAging(asOfDate?: string): Promise<AccountsReceivableAging> {
    const qs = asOfDate ? `?as_of_date=${asOfDate}` : "";
    return this.request<AccountsReceivableAging>(`/reports/ar-aging${qs}`);
  }

  // --- Reconciliation endpoints ---

  async getReconciliationSummary(businessId: string): Promise<ReconciliationSummary> {
    return this.request<ReconciliationSummary>(`/businesses/${businessId}/reconciliation/summary`);
  }

  async getReconciliationSuggestions(businessId: string): Promise<ReconciliationSuggestion[]> {
    return this.request<ReconciliationSuggestion[]>(`/businesses/${businessId}/reconciliation/suggestions`);
  }

  async getUnreconciledTransactions(businessId: string, limit?: number, offset?: number): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.set("limit", String(limit));
    if (offset !== undefined) params.set("offset", String(offset));
    const qs = params.toString();
    return this.request<Transaction[]>(`/businesses/${businessId}/reconciliation/unreconciled${qs ? `?${qs}` : ""}`);
  }

  async confirmMatch(businessId: string, data: ConfirmMatchRequest): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/reconciliation/confirm`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async rejectMatch(businessId: string, data: RejectMatchRequest): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/reconciliation/reject`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async unlinkMatch(businessId: string, data: UnlinkMatchRequest): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/reconciliation/unlink`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async autoReconcile(businessId: string, minConfidence?: number): Promise<AutoReconcileResponse> {
    return this.request<AutoReconcileResponse>(`/businesses/${businessId}/reconciliation/auto`, {
      method: "POST",
      body: JSON.stringify({ min_confidence: minConfidence ?? 0.9 }),
    });
  }

  async markReconciled(businessId: string, data: ManualReconcileRequest): Promise<ManualReconcileResponse> {
    return this.request<ManualReconcileResponse>(`/businesses/${businessId}/reconciliation/mark-reconciled`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async markUnreconciled(businessId: string, data: ManualReconcileRequest): Promise<ManualReconcileResponse> {
    return this.request<ManualReconcileResponse>(`/businesses/${businessId}/reconciliation/mark-unreconciled`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getReconciledTransactions(businessId: string, limit?: number, offset?: number): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.set("limit", String(limit));
    if (offset !== undefined) params.set("offset", String(offset));
    const qs = params.toString();
    return this.request<Transaction[]>(`/businesses/${businessId}/reconciliation/reconciled${qs ? `?${qs}` : ""}`);
  }

  async findDuplicates(businessId: string): Promise<DuplicateGroup[]> {
    return this.request<DuplicateGroup[]>(`/businesses/${businessId}/transactions/duplicates`);
  }
}

export const api = new ApiClient(API_BASE_URL);
