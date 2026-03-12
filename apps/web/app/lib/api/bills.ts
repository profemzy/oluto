/**
 * Bills API - Accounts payable management
 */
import { ApiClient } from './client';
import type {
  Bill,
  BillWithLineItems,
  CreateBillRequest,
  BillListParams,
  BillPayment,
  CreateBillPaymentRequest,
} from './types';

export class BillsApi extends ApiClient {
  async listBills(businessId: string, params?: BillListParams): Promise<Bill[]> {
    const qs = this.buildQueryString(params as Record<string, unknown> ?? {});
    return this.request<Bill[]>(`/businesses/${businessId}/bills${qs}`);
  }

  // Alias for backward compatibility
  async list(businessId: string, params?: BillListParams): Promise<Bill[]> {
    return this.listBills(businessId, params);
  }

  async getBill(businessId: string, billId: string): Promise<BillWithLineItems> {
    return this.request<BillWithLineItems>(`/businesses/${businessId}/bills/${billId}`);
  }

  // Alias for backward compatibility
  async get(businessId: string, billId: string): Promise<BillWithLineItems> {
    return this.getBill(businessId, billId);
  }

  async createBill(businessId: string, data: CreateBillRequest): Promise<Bill> {
    return this.request<Bill>(`/businesses/${businessId}/bills`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Alias for backward compatibility
  async create(businessId: string, data: CreateBillRequest): Promise<Bill> {
    return this.createBill(businessId, data);
  }

  async updateBillStatus(businessId: string, billId: string, status: string): Promise<Bill> {
    return this.request<Bill>(`/businesses/${businessId}/bills/${billId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Alias for backward compatibility
  async updateStatus(businessId: string, billId: string, status: string): Promise<Bill> {
    return this.updateBillStatus(businessId, billId, status);
  }

  async deleteBill(businessId: string, billId: string): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/bills/${billId}`, {
      method: 'DELETE',
    });
  }

  // Alias for backward compatibility
  async delete(businessId: string, billId: string): Promise<void> {
    return this.deleteBill(businessId, billId);
  }

  async getOverdueBills(businessId: string): Promise<Bill[]> {
    return this.request<Bill[]>(`/businesses/${businessId}/bills/overdue`);
  }

  // Alias for backward compatibility
  async getOverdue(businessId: string): Promise<Bill[]> {
    return this.getOverdueBills(businessId);
  }

  async getVendorBills(businessId: string, vendorId: string): Promise<Bill[]> {
    return this.request<Bill[]>(`/businesses/${businessId}/vendors/${vendorId}/bills`);
  }

  async createBillPayment(businessId: string, data: CreateBillPaymentRequest): Promise<BillPayment> {
    return this.request<BillPayment>(`/businesses/${businessId}/bill-payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
