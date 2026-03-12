/**
 * Base API Client - Core fetch logic with error handling
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export interface TokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}

export interface TokenResponseWithRefresh extends TokenResponse {
  refresh_token?: string;
}

type TokenProvider = () => Promise<string | null>;

export class ApiClient {
  private baseUrl: string;
  private tokenProvider: TokenProvider | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (this.tokenProvider) {
      const token = await this.tokenProvider();
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    }
    return {};
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let error: { detail?: string; error?: string; code?: string; details?: Record<string, string[]> } = {
        detail: 'An error occurred',
      };

      // Handle non-JSON responses (HTML error pages, etc.)
      if (contentType?.includes('application/json')) {
        try {
          error = await response.json();
        } catch {
          error = { detail: `HTTP ${response.status}: ${response.statusText}` };
        }
      } else {
        error = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }

      throw new ApiError(
        error.error || error.detail || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        error.code,
        error.details
      );
    }

    // Handle empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    const json = await response.json();
    // LedgerForge wraps responses in { success, data } — unwrap if present
    return json.data !== undefined ? json.data : json;
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, options);
  }

  protected async uploadRequest<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();

    // Do NOT set Content-Type — browser sets it with boundary for multipart
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let error: { detail?: string; error?: string } = { detail: 'Upload failed' };

      if (contentType?.includes('application/json')) {
        try {
          error = await response.json();
        } catch {
          error = { detail: `HTTP ${response.status}: ${response.statusText}` };
        }
      } else {
        error = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }

      throw new ApiError(error.error || error.detail || `HTTP ${response.status}: ${response.statusText}`, response.status);
    }

    const json = await response.json();
    return json.data !== undefined ? json.data : json;
  }

  protected buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    return qs ? `?${qs}` : '';
  }
}
