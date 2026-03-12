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
    const qs = this.buildQueryString(params as Record<string, unknown> ?? {});
    return this.request<Payment[]>(`/businesses/${businessId}/payments${qs}`);
  }

  // Alias for backward compatibility
  async list(businessId: string, params?: PaymentListParams): Promise<Payment[]> {
    return this.listPayments(businessId, params);
  }

  async getPayment(businessId: string, paymentId: string): Promise<Payment> {
    return this.request<Payment>(`/businesses/${businessId}/payments/${paymentId}`);
  }

  // Alias for backward compatibility
  async get(businessId: string, paymentId: string): Promise<Payment> {
    return this.getPayment(businessId, paymentId);
  }

  async createPayment(businessId: string, data: CreatePaymentRequest): Promise<Payment> {
    return this.request<Payment>(`/businesses/${businessId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Alias for backward compatibility
  async create(businessId: string, data: CreatePaymentRequest): Promise<Payment> {
    return this.createPayment(businessId, data);
  }

  async applyPayment(businessId: string, paymentId: string, data: ApplyPaymentRequest): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/payments/${paymentId}/apply`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Alias for backward compatibility
  async apply(businessId: string, paymentId: string, data: ApplyPaymentRequest): Promise<void> {
    return this.applyPayment(businessId, paymentId, data);
  }

  async getUnappliedPayments(businessId: string, customerId?: string): Promise<Payment[]> {
    const qs = customerId ? `?customer_id=${customerId}` : '';
    return this.request<Payment[]>(`/businesses/${businessId}/payments/unapplied${qs}`);
  }

  // Alias for backward compatibility
  async getUnapplied(businessId: string, customerId?: string): Promise<Payment[]> {
    return this.getUnappliedPayments(businessId, customerId);
  }

  async createBillPayment(businessId: string, data: CreateBillPaymentRequest): Promise<BillPayment> {
    return this.request<BillPayment>(`/businesses/${businessId}/bill-payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
