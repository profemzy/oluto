/**
 * Reconciliation API - Bank reconciliation management
 */
import { ApiClient } from './client';
import type {
  ReconciliationSummary,
  ReconciliationSuggestion,
  Transaction,
  ConfirmMatchRequest,
  RejectMatchRequest,
  UnlinkMatchRequest,
  AutoReconcileResponse,
  ManualReconcileRequest,
  ManualReconcileResponse,
  DuplicateGroup,
} from './types';

export class ReconciliationApi extends ApiClient {
  async getReconciliationSummary(businessId: string): Promise<ReconciliationSummary> {
    return this.request<ReconciliationSummary>(
      `/businesses/${businessId}/reconciliation/summary`
    );
  }

  async getReconciliationSuggestions(businessId: string): Promise<ReconciliationSuggestion[]> {
    return this.request<ReconciliationSuggestion[]>(
      `/businesses/${businessId}/reconciliation/suggestions`
    );
  }

  async getUnreconciledTransactions(
    businessId: string,
    limit?: number,
    offset?: number
  ): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.set('limit', String(limit));
    if (offset !== undefined) params.set('offset', String(offset));
    const qs = params.toString();
    return this.request<Transaction[]>(
      `/businesses/${businessId}/reconciliation/unreconciled${qs ? `?${qs}` : ''}`
    );
  }

  async confirmMatch(businessId: string, data: ConfirmMatchRequest): Promise<void> {
    await this.request<Record<string, never>>(
      `/businesses/${businessId}/reconciliation/confirm`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async rejectMatch(businessId: string, data: RejectMatchRequest): Promise<void> {
    await this.request<Record<string, never>>(
      `/businesses/${businessId}/reconciliation/reject`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async unlinkMatch(businessId: string, data: UnlinkMatchRequest): Promise<void> {
    await this.request<Record<string, never>>(
      `/businesses/${businessId}/reconciliation/unlink`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async autoReconcile(businessId: string, minConfidence?: number): Promise<AutoReconcileResponse> {
    return this.request<AutoReconcileResponse>(
      `/businesses/${businessId}/reconciliation/auto`,
      {
        method: 'POST',
        body: JSON.stringify({ min_confidence: minConfidence ?? 0.9 }),
      }
    );
  }

  async markReconciled(
    businessId: string,
    data: ManualReconcileRequest
  ): Promise<ManualReconcileResponse> {
    return this.request<ManualReconcileResponse>(
      `/businesses/${businessId}/reconciliation/mark-reconciled`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async markUnreconciled(
    businessId: string,
    data: ManualReconcileRequest
  ): Promise<ManualReconcileResponse> {
    return this.request<ManualReconcileResponse>(
      `/businesses/${businessId}/reconciliation/mark-unreconciled`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getReconciledTransactions(
    businessId: string,
    limit?: number,
    offset?: number
  ): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.set('limit', String(limit));
    if (offset !== undefined) params.set('offset', String(offset));
    const qs = params.toString();
    return this.request<Transaction[]>(
      `/businesses/${businessId}/reconciliation/reconciled${qs ? `?${qs}` : ''}`
    );
  }

  async findDuplicates(businessId: string): Promise<DuplicateGroup[]> {
    return this.request<DuplicateGroup[]>(
      `/businesses/${businessId}/transactions/duplicates`
    );
  }
}
