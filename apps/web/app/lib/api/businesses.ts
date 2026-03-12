/**
 * Businesses API - Business workspace management
 */
import { ApiClient } from './client';
import type { BusinessCreate, BusinessResponse } from './types';

export class BusinessesApi extends ApiClient {
  async createBusiness(data: BusinessCreate): Promise<BusinessResponse> {
    return this.request<BusinessResponse>('/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listBusinesses(): Promise<BusinessResponse[]> {
    return this.request<BusinessResponse[]>('/businesses');
  }

  async getBusiness(businessId: string): Promise<BusinessResponse> {
    return this.request<BusinessResponse>(`/businesses/${businessId}`);
  }

  async updateBusiness(businessId: string, data: Partial<BusinessCreate>): Promise<BusinessResponse> {
    return this.request<BusinessResponse>(`/businesses/${businessId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}
