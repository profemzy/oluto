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
  contact_id: string;
  contact_name: string;
  current: string;
  days_1_30: string;
  days_31_60: string;
  days_61_90: string;
  days_over_90: string;
  total: string;
}

export interface AccountsReceivableAging {
  as_of_date: string;
  buckets: AgingBucket[];
  totals: {
    current: string;
    days_1_30: string;
    days_31_60: string;
    days_61_90: string;
    days_over_90: string;
    total: string;
  };
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
}

export const api = new ApiClient(API_BASE_URL);
