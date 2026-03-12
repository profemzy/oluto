/**
 * Payments API - Customer and vendor payment management
 */
import { ApiClient } from './client';
import type {
  Payment,
  CreatePaymentRequest,
  ApplyPaymentRequest,
  PaymentListParams,
  BillPayment,
  CreateBillPaymentRequest,
} from './types';

export class PaymentsApi extends ApiClient {
  async listPayments(businessId: string, params?: PaymentListParams): Promise<Payment[]> {
    const qs = this.buildQueryString(params ?? {});
    return this.request<Payment[]>(`/businesses/${businessId}/payments${qs}`);
  }

  async getPayment(businessId: string, paymentId: string): Promise<Payment> {
    return this.request<Payment>(`/businesses/${businessId}/payments/${paymentId}`);
  }

  async createPayment(businessId: string, data: CreatePaymentRequest): Promise<Payment> {
    return this.request<Payment>(`/businesses/${businessId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async applyPayment(businessId: string, paymentId: string, data: ApplyPaymentRequest): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/payments/${paymentId}/apply`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUnappliedPayments(businessId: string, customerId?: string): Promise<Payment[]> {
    const qs = customerId ? `?customer_id=${customerId}` : '';
    return this.request<Payment[]>(`/businesses/${businessId}/payments/unapplied${qs}`);
  }

  async createBillPayment(businessId: string, data: CreateBillPaymentRequest): Promise<BillPayment> {
    return this.request<BillPayment>(`/businesses/${businessId}/bill-payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
