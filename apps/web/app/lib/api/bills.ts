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
    const qs = this.buildQueryString(params ?? {});
    return this.request<Bill[]>(`/businesses/${businessId}/bills${qs}`);
  }

  async getBill(businessId: string, billId: string): Promise<BillWithLineItems> {
    return this.request<BillWithLineItems>(`/businesses/${businessId}/bills/${billId}`);
  }

  async createBill(businessId: string, data: CreateBillRequest): Promise<Bill> {
    return this.request<Bill>(`/businesses/${businessId}/bills`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBillStatus(businessId: string, billId: string, status: string): Promise<Bill> {
    return this.request<Bill>(`/businesses/${businessId}/bills/${billId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteBill(businessId: string, billId: string): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/bills/${billId}`, {
      method: 'DELETE',
    });
  }

  async getOverdueBills(businessId: string): Promise<Bill[]> {
    return this.request<Bill[]>(`/businesses/${businessId}/bills/overdue`);
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
