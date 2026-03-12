/**
 * Invoices API - Accounts receivable management
 */
import { ApiClient } from './client';
import type {
  Invoice,
  InvoiceWithLineItems,
  CreateInvoiceRequest,
  InvoiceListParams,
  Payment,
} from './types';

export class InvoicesApi extends ApiClient {
  async listInvoices(businessId: string, params?: InvoiceListParams): Promise<Invoice[]> {
    const qs = this.buildQueryString(params ?? {});
    return this.request<Invoice[]>(`/businesses/${businessId}/invoices${qs}`);
  }

  async getInvoice(businessId: string, invoiceId: string): Promise<InvoiceWithLineItems> {
    return this.request<InvoiceWithLineItems>(`/businesses/${businessId}/invoices/${invoiceId}`);
  }

  async createInvoice(businessId: string, data: CreateInvoiceRequest): Promise<InvoiceWithLineItems> {
    return this.request<InvoiceWithLineItems>(`/businesses/${businessId}/invoices`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoiceStatus(businessId: string, invoiceId: string, status: string): Promise<Invoice> {
    return this.request<Invoice>(`/businesses/${businessId}/invoices/${invoiceId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getOverdueInvoices(businessId: string): Promise<Invoice[]> {
    return this.request<Invoice[]>(`/businesses/${businessId}/invoices/overdue`);
  }

  async getCustomerInvoices(businessId: string, customerId: string): Promise<Invoice[]> {
    return this.request<Invoice[]>(`/businesses/${businessId}/customers/${customerId}/invoices`);
  }

  async getInvoicePayments(businessId: string, invoiceId: string): Promise<Payment[]> {
    return this.request<Payment[]>(`/businesses/${businessId}/invoices/${invoiceId}/payments`);
  }
}
