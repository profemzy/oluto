/**
 * Transactions API - Transaction CRUD and import
 */
import { ApiClient } from './client';
import type {
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  TransactionListParams,
  DashboardSummary,
  ImportParseResponse,
  ImportConfirmRequest,
  ImportConfirmResponse,
  CategorySuggestRequest,
  CategorySuggestResponse,
  BulkStatusUpdateRequest,
  BulkStatusUpdateResponse,
  AsyncJobStatusResponse,
  DuplicateGroup,
} from './types';

export class TransactionsApi extends ApiClient {
  async createTransaction(businessId: string, data: TransactionCreate): Promise<Transaction> {
    return this.request<Transaction>(`/businesses/${businessId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listTransactions(businessId: string, params?: TransactionListParams): Promise<Transaction[]> {
    const qs = this.buildQueryString(params as Record<string, unknown> ?? {});
    return this.request<Transaction[]>(`/businesses/${businessId}/transactions${qs}`);
  }

  // Alias for backward compatibility
  async list(businessId: string, params?: TransactionListParams): Promise<Transaction[]> {
    return this.listTransactions(businessId, params);
  }

  async getTransaction(businessId: string, transactionId: string): Promise<Transaction> {
    return this.request<Transaction>(`/businesses/${businessId}/transactions/${transactionId}`);
  }

  // Alias for backward compatibility
  async get(businessId: string, transactionId: string): Promise<Transaction> {
    return this.getTransaction(businessId, transactionId);
  }

  async updateTransaction(businessId: string, transactionId: string, data: TransactionUpdate): Promise<Transaction> {
    return this.request<Transaction>(`/businesses/${businessId}/transactions/${transactionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Alias for backward compatibility
  async update(businessId: string, transactionId: string, data: TransactionUpdate): Promise<Transaction> {
    return this.updateTransaction(businessId, transactionId, data);
  }

  async deleteTransaction(businessId: string, transactionId: string): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/transactions/${transactionId}`, {
      method: 'DELETE',
    });
  }

  // Alias for backward compatibility
  async delete(businessId: string, transactionId: string): Promise<void> {
    return this.deleteTransaction(businessId, transactionId);
  }

  async create(businessId: string, data: TransactionCreate): Promise<Transaction> {
    return this.createTransaction(businessId, data);
  }

  async getDashboardSummary(businessId: string): Promise<DashboardSummary> {
    return this.request<DashboardSummary>(`/businesses/${businessId}/transactions/summary`);
  }

  async parseImportFile(businessId: string, file: File): Promise<ImportParseResponse | { job_id: number; status: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.uploadRequest<ImportParseResponse | { job_id: number; status: string; message: string }>(
      `/businesses/${businessId}/transactions/import/parse`,
      formData
    );
  }

  async confirmImport(businessId: string, data: ImportConfirmRequest): Promise<ImportConfirmResponse> {
    return this.request<ImportConfirmResponse>(`/businesses/${businessId}/transactions/import/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async suggestCategory(businessId: string, data: CategorySuggestRequest): Promise<CategorySuggestResponse> {
    return this.request<CategorySuggestResponse>(`/businesses/${businessId}/transactions/suggest-category`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateStatus(businessId: string, data: BulkStatusUpdateRequest): Promise<BulkStatusUpdateResponse> {
    return this.request<BulkStatusUpdateResponse>(`/businesses/${businessId}/transactions/bulk-status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getJobStatus(businessId: string, jobId: number): Promise<AsyncJobStatusResponse> {
    return this.request<AsyncJobStatusResponse>(`/businesses/${businessId}/transactions/jobs/${jobId}`);
  }

  async findDuplicates(businessId: string): Promise<DuplicateGroup[]> {
    return this.request<DuplicateGroup[]>(`/businesses/${businessId}/transactions/duplicates`);
  }
}
