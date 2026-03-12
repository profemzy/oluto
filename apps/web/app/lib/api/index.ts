/**
 * API Client - Modular API client for LedgerForge
 *
 * Usage:
 * ```typescript
 * import { api } from '@/app/lib/api';
 *
 * // Fetch current user
 * const user = await api.auth.getCurrentUser();
 *
 * // List transactions
 * const transactions = await api.transactions.list(businessId, { status: 'posted' });
 * ```
 */

import { ApiClient, ApiError, NetworkError } from './client';
import { AuthApi } from './auth';
import { BusinessesApi } from './businesses';
import { TransactionsApi } from './transactions';
import { ContactsApi } from './contacts';
import { AccountsApi } from './accounts';
import { InvoicesApi } from './invoices';
import { BillsApi } from './bills';
import { PaymentsApi } from './payments';
import { ReceiptsApi } from './receipts';
import { ReportsApi } from './reports';
import { ReconciliationApi } from './reconciliation';
import { ChatApi } from './chat';
import { QuickBooksApi } from './quickbooks';

// Re-export all types
export * from './types';
export * from './client';

// Re-export domain APIs
export {
  AuthApi,
  BusinessesApi,
  TransactionsApi,
  ContactsApi,
  AccountsApi,
  InvoicesApi,
  BillsApi,
  PaymentsApi,
  ReceiptsApi,
  ReportsApi,
  ReconciliationApi,
  ChatApi,
  QuickBooksApi,
};

/**
 * Unified API client with all domain modules
 */
class UnifiedApiClient {
  readonly auth: AuthApi;
  readonly businesses: BusinessesApi;
  readonly transactions: TransactionsApi;
  readonly contacts: ContactsApi;
  readonly accounts: AccountsApi;
  readonly invoices: InvoicesApi;
  readonly bills: BillsApi;
  readonly payments: PaymentsApi;
  readonly receipts: ReceiptsApi;
  readonly reports: ReportsApi;
  readonly reconciliation: ReconciliationApi;
  readonly chat: ChatApi;
  readonly quickbooks: QuickBooksApi;

  constructor(baseUrl: string) {
    this.auth = new AuthApi(baseUrl);
    this.businesses = new BusinessesApi(baseUrl);
    this.transactions = new TransactionsApi(baseUrl);
    this.contacts = new ContactsApi(baseUrl);
    this.accounts = new AccountsApi(baseUrl);
    this.invoices = new InvoicesApi(baseUrl);
    this.bills = new BillsApi(baseUrl);
    this.payments = new PaymentsApi(baseUrl);
    this.receipts = new ReceiptsApi(baseUrl);
    this.reports = new ReportsApi(baseUrl);
    this.reconciliation = new ReconciliationApi(baseUrl);
    this.chat = new ChatApi(baseUrl);
    this.quickbooks = new QuickBooksApi(baseUrl);
  }

  setTokenProvider(provider: () => Promise<string | null>): void {
    // Set token provider on all domain APIs
    this.auth.setTokenProvider(provider);
    this.businesses.setTokenProvider(provider);
    this.transactions.setTokenProvider(provider);
    this.contacts.setTokenProvider(provider);
    this.accounts.setTokenProvider(provider);
    this.invoices.setTokenProvider(provider);
    this.bills.setTokenProvider(provider);
    this.payments.setTokenProvider(provider);
    this.receipts.setTokenProvider(provider);
    this.reports.setTokenProvider(provider);
    this.reconciliation.setTokenProvider(provider);
    this.chat.setTokenProvider(provider);
    this.quickbooks.setTokenProvider(provider);
  }
}

// Create the default API instance
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
export const api = new UnifiedApiClient(API_BASE_URL);

// Legacy exports for backward compatibility
// These will be removed in a future version
export { ApiClient };
export default api;

/**
 * Compute aging totals from AR aging report
 */
export function computeAgingTotals(aging: AccountsReceivableAging): {
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  days_91_plus: number;
  total: number;
} {
  const totals = aging.customers.reduce(
    (acc, customer) => ({
      current: acc.current + parseFloat(customer.current) || 0,
      days_1_30: acc.days_1_30 + (parseFloat(customer.days_30) || 0),
      days_31_60: acc.days_31_60 + (parseFloat(customer.days_60) || 0),
      days_61_90: acc.days_61_90 + (parseFloat(customer.days_90) || 0),
      days_91_plus: acc.days_91_plus,
      total: acc.total + (parseFloat(customer.total) || 0),
    }),
    { current: 0, days_1_30: 0, days_31_60: 0, days_61_90: 0, days_91_plus: 0, total: 0 }
  );

  return totals;
}
