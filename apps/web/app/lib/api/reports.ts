/**
 * Reports API - Financial statement generation
 */
import { ApiClient } from './client';
import type {
  TrialBalance,
  ProfitLossStatement,
  BalanceSheet,
  AccountsReceivableAging,
} from './types';

export class ReportsApi extends ApiClient {
  async getTrialBalance(businessId: string, asOfDate?: string): Promise<TrialBalance> {
    const qs = asOfDate ? `?as_of_date=${asOfDate}` : '';
    return this.request<TrialBalance>(`/businesses/${businessId}/reports/trial-balance${qs}`);
  }

  async getProfitLoss(
    businessId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ProfitLossStatement> {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const qs = params.toString();
    return this.request<ProfitLossStatement>(
      `/businesses/${businessId}/reports/profit-loss${qs ? `?${qs}` : ''}`
    );
  }

  async getBalanceSheet(businessId: string, asOfDate?: string): Promise<BalanceSheet> {
    const qs = asOfDate ? `?as_of_date=${asOfDate}` : '';
    return this.request<BalanceSheet>(
      `/businesses/${businessId}/reports/balance-sheet${qs}`
    );
  }

  async getArAging(businessId: string, asOfDate?: string): Promise<AccountsReceivableAging> {
    const qs = asOfDate ? `?as_of_date=${asOfDate}` : '';
    return this.request<AccountsReceivableAging>(
      `/businesses/${businessId}/reports/ar-aging${qs}`
    );
  }
}
