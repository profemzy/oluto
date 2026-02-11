const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  business_id: number | null;
}

// --- Business Types ---

export interface BusinessCreate {
  name: string;
  province?: string;
  tax_profile?: string;
}

export interface BusinessResponse {
  id: number;
  name: string;
  province: string | null;
  tax_profile: string | null;
  created_at: string | null;
}

// --- Transaction Types ---

export interface Transaction {
  id: number;
  vendor_name: string;
  amount: string;
  currency: string;
  description: string | null;
  transaction_date: string;
  category: string | null;
  status: string;
  gst_amount: string;
  pst_amount: string;
  ai_confidence: number;
  ai_suggested_category: string | null;
  business_id: number;
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
  source_device?: "web" | "mobile" | "voice";
  ai_suggested_category?: string;
  ai_confidence?: number;
}

export interface TransactionUpdate {
  vendor_name?: string;
  amount?: string;
  currency?: string;
  description?: string;
  transaction_date?: string;
  category?: string;
  status?: string;
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
  ai_confidence: number;
  is_duplicate: boolean;
  duplicate_transaction_id: number | null;
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
  transaction_ids?: number[];
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
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
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
        error.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
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
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
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

  async getBusiness(businessId: number): Promise<BusinessResponse> {
    return this.request<BusinessResponse>(`/businesses/${businessId}`);
  }

  async updateBusiness(businessId: number, data: Partial<BusinessCreate>): Promise<BusinessResponse> {
    return this.request<BusinessResponse>(`/businesses/${businessId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // --- Transaction endpoints ---

  async createTransaction(businessId: number, data: TransactionCreate): Promise<Transaction> {
    return this.request<Transaction>(`/businesses/${businessId}/transactions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listTransactions(businessId: number, params?: TransactionListParams): Promise<Transaction[]> {
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

  async getTransaction(businessId: number, transactionId: number): Promise<Transaction> {
    return this.request<Transaction>(`/businesses/${businessId}/transactions/${transactionId}`);
  }

  async updateTransaction(businessId: number, transactionId: number, data: TransactionUpdate): Promise<Transaction> {
    return this.request<Transaction>(`/businesses/${businessId}/transactions/${transactionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(businessId: number, transactionId: number): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/transactions/${transactionId}`, {
      method: "DELETE",
    });
  }

  // --- Dashboard endpoints ---

  async getDashboardSummary(businessId: number): Promise<DashboardSummary> {
    return this.request<DashboardSummary>(`/businesses/${businessId}/transactions/summary`);
  }

  // --- Import endpoints ---

  async parseImportFile(
    businessId: number,
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
    businessId: number,
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
    businessId: number,
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
    businessId: number,
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
    businessId: number,
    jobId: number
  ): Promise<AsyncJobStatusResponse> {
    return this.request<AsyncJobStatusResponse>(
      `/businesses/${businessId}/transactions/jobs/${jobId}`
    );
  }
}

export const api = new ApiClient(API_BASE_URL);
