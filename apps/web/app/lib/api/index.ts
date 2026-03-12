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

// Re-export all types (excluding duplicates)
export * from './types';
export { ApiError, NetworkError } from './client';

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

  // Backward compatibility methods - deprecated, use domain APIs instead
  // These will be removed in a future version
  async getCurrentUser() { return this.auth.getCurrentUser(); }
  async createBusiness(data: any) { return this.businesses.create(data); }
  async listBusinesses() { return this.businesses.list(); }
  async getBusiness(id: string) { return this.businesses.get(id); }
  async updateBusiness(id: string, data: any) { return this.businesses.update(id, data); }
  async createTransaction(businessId: string, data: any) { return this.transactions.create(businessId, data); }
  async listTransactions(businessId: string, params?: any) { return this.transactions.list(businessId, params); }
  async getTransaction(businessId: string, id: string) { return this.transactions.get(businessId, id); }
  async updateTransaction(businessId: string, id: string, data: any) { return this.transactions.update(businessId, id, data); }
  async deleteTransaction(businessId: string, id: string) { return this.transactions.delete(businessId, id); }
  async getDashboardSummary(businessId: string) { return this.transactions.getDashboardSummary(businessId); }
  async parseImportFile(businessId: string, file: File) { return this.transactions.parseImportFile(businessId, file); }
  async confirmImport(businessId: string, data: any) { return this.transactions.confirmImport(businessId, data); }
  async suggestCategory(businessId: string, data: any) { return this.transactions.suggestCategory(businessId, data); }
  async bulkUpdateStatus(businessId: string, data: any) { return this.transactions.bulkUpdateStatus(businessId, data); }
  async getJobStatus(businessId: string, jobId: number) { return this.transactions.getJobStatus(businessId, jobId); }
  async findDuplicates(businessId: string) { return this.transactions.findDuplicates(businessId); }
  async listContacts(businessId: string) { return this.contacts.list(businessId); }
  async getCustomers(businessId: string) { return this.contacts.getCustomers(businessId); }
  async getVendors(businessId: string) { return this.contacts.getVendors(businessId); }
  async getEmployees(businessId: string) { return this.contacts.getEmployees(businessId); }
  async getContact(businessId: string, id: string) { return this.contacts.get(businessId, id); }
  async createContact(businessId: string, data: any) { return this.contacts.create(businessId, data); }
  async updateContact(businessId: string, id: string, data: any) { return this.contacts.update(businessId, id, data); }
  async deleteContact(businessId: string, id: string) { return this.contacts.delete(businessId, id); }
  async listAccounts(businessId: string) { return this.accounts.list(businessId); }
  async getAccount(businessId: string, id: string) { return this.accounts.get(businessId, id); }
  async createAccount(businessId: string, data: any) { return this.accounts.create(businessId, data); }
  async updateAccount(businessId: string, id: string, data: any) { return this.accounts.update(businessId, id, data); }
  async deactivateAccount(businessId: string, id: string) { return this.accounts.deactivate(businessId, id); }
  async listInvoices(businessId: string, params?: any) { return this.invoices.list(businessId, params); }
  async getInvoice(businessId: string, id: string) { return this.invoices.get(businessId, id); }
  async createInvoice(businessId: string, data: any) { return this.invoices.create(businessId, data); }
  async updateInvoiceStatus(businessId: string, id: string, status: string) { return this.invoices.updateStatus(businessId, id, status); }
  async getOverdueInvoices(businessId: string) { return this.invoices.getOverdue(businessId); }
  async getCustomerInvoices(businessId: string, customerId: string) { return this.invoices.getCustomerInvoices(businessId, customerId); }
  async getInvoicePayments(businessId: string, invoiceId: string) { return this.invoices.getPayments(businessId, invoiceId); }
  async listBills(businessId: string, params?: any) { return this.bills.list(businessId, params); }
  async getBill(businessId: string, id: string) { return this.bills.get(businessId, id); }
  async createBill(businessId: string, data: any) { return this.bills.create(businessId, data); }
  async updateBillStatus(businessId: string, id: string, status: string) { return this.bills.updateStatus(businessId, id, status); }
  async deleteBill(businessId: string, id: string) { return this.bills.delete(businessId, id); }
  async getOverdueBills(businessId: string) { return this.bills.getOverdue(businessId); }
  async getVendorBills(businessId: string, vendorId: string) { return this.bills.getVendorBills(businessId, vendorId); }
  async listPayments(businessId: string, params?: any) { return this.payments.list(businessId, params); }
  async getPayment(businessId: string, id: string) { return this.payments.get(businessId, id); }
  async createPayment(businessId: string, data: any) { return this.payments.create(businessId, data); }
  async applyPayment(businessId: string, id: string, data: any) { return this.payments.apply(businessId, id, data); }
  async getUnappliedPayments(businessId: string, customerId?: string) { return this.payments.getUnapplied(businessId, customerId); }
  async createBillPayment(businessId: string, data: any) { return this.payments.createBillPayment(businessId, data); }
  async uploadReceipt(businessId: string, transactionId: string, file: File, runOcr?: boolean) { return this.receipts.uploadReceipt(businessId, transactionId, file, runOcr); }
  async listReceipts(businessId: string, transactionId: string) { return this.receipts.list(businessId, transactionId); }
  async getReceipt(businessId: string, id: string) { return this.receipts.get(businessId, id); }
  async deleteReceipt(businessId: string, id: string) { return this.receipts.delete(businessId, id); }
  async getReceiptDownloadUrl(businessId: string, id: string) { return this.receipts.getDownloadUrl(businessId, id); }
  async uploadBillReceipt(businessId: string, billId: string, file: File, runOcr?: boolean) { return this.receipts.uploadBillReceipt(businessId, billId, file, runOcr); }
  async listBillReceipts(businessId: string, billId: string) { return this.receipts.listBillReceipts(businessId, billId); }
  async extractOcrFromReceipt(businessId: string, file: File) { return this.receipts.extractOcr(file, businessId); }
  async getTrialBalance(businessId: string, asOfDate?: string) { return this.reports.getTrialBalance(businessId, asOfDate); }
  async getProfitLoss(businessId: string, startDate?: string, endDate?: string) { return this.reports.getProfitLoss(businessId, startDate, endDate); }
  async getBalanceSheet(businessId: string, asOfDate?: string) { return this.reports.getBalanceSheet(businessId, asOfDate); }
  async getArAging(businessId: string, asOfDate?: string) { return this.reports.getArAging(businessId, asOfDate); }
  async getReconciliationSummary(businessId: string) { return this.reconciliation.getSummary(businessId); }
  async getReconciliationSuggestions(businessId: string) { return this.reconciliation.getSuggestions(businessId); }
  async getUnreconciledTransactions(businessId: string, limit?: number, offset?: number) { return this.reconciliation.getUnreconciled(businessId, limit, offset); }
  async confirmMatch(businessId: string, data: any) { return this.reconciliation.confirmMatch(businessId, data); }
  async rejectMatch(businessId: string, data: any) { return this.reconciliation.rejectMatch(businessId, data); }
  async unlinkMatch(businessId: string, data: any) { return this.reconciliation.unlinkMatch(businessId, data); }
  async autoReconcile(businessId: string, minConfidence?: number) { return this.reconciliation.autoReconcile(businessId, minConfidence); }
  async markReconciled(businessId: string, data: any) { return this.reconciliation.markReconciled(businessId, data); }
  async markUnreconciled(businessId: string, data: any) { return this.reconciliation.markUnreconciled(businessId, data); }
  async getReconciledTransactions(businessId: string, limit?: number, offset?: number) { return this.reconciliation.getReconciled(businessId, limit, offset); }
  async listConversations(businessId: string) { return this.chat.listConversations(businessId); }
  async createConversation(businessId: string, title?: string) { return this.chat.createConversation(businessId, title); }
  async updateConversation(businessId: string, convId: string, data: any) { return this.chat.updateConversation(businessId, convId, data); }
  async deleteConversation(businessId: string, convId: string) { return this.chat.deleteConversation(businessId, convId); }
  async listMessages(businessId: string, convId: string) { return this.chat.listMessages(businessId, convId); }
  async createMessage(businessId: string, convId: string, data: any) { return this.chat.createMessage(businessId, convId, data); }
  async deleteMessage(businessId: string, convId: string, msgId: string) { return this.chat.deleteMessage(businessId, convId, msgId); }
  async sendChatMessage(message: string, businessId: string, timezone?: string) { return this.chat.sendChatMessage(message, businessId, timezone); }
  async sendChatMessageWithFile(message: string, file: File, businessId: string, timezone?: string) { return this.chat.sendChatMessageWithFile(message, file, businessId, timezone); }
  async parseQuickBooksImport(businessId: string, files: Record<string, File>) { return this.quickbooks.parseImport(businessId, files); }
  async confirmQuickBooksImport(businessId: string, data: any) { return this.quickbooks.confirmImport(businessId, data); }
}

// Create the default API instance
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
export const api = new UnifiedApiClient(API_BASE_URL);

// Default export for backward compatibility
export default api;

/**
 * Compute aging totals from AR aging report
 */
export function computeAgingTotals(aging: import('./types').AccountsReceivableAging | undefined): {
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  days_91_plus: number;
  total: number;
} {
  if (!aging || !aging.customers || !Array.isArray(aging.customers)) {
    return { current: 0, days_1_30: 0, days_31_60: 0, days_61_90: 0, days_91_plus: 0, total: 0 };
  }

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
