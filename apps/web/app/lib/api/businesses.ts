/**
 * Businesses API - Business workspace management
 */
import { ApiClient } from './client';
import type { BusinessCreate, BusinessResponse } from './types';

export class BusinessesApi extends ApiClient {
  async create(data: BusinessCreate): Promise<BusinessResponse> {
    return this.request<BusinessResponse>('/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async list(): Promise<BusinessResponse[]> {
    return this.request<BusinessResponse[]>('/businesses');
  }

  async get(id: string): Promise<BusinessResponse> {
    return this.request<BusinessResponse>(`/businesses/${id}`);
  }

  async update(id: string, data: Partial<BusinessCreate>): Promise<BusinessResponse> {
    return this.request<BusinessResponse>(`/businesses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createBusiness(data: BusinessCreate): Promise<BusinessResponse> {
    return this.create(data);
  }

  async listBusinesses(): Promise<BusinessResponse[]> {
    return this.list();
  }

  async getBusiness(businessId: string): Promise<BusinessResponse> {
    return this.get(businessId);
  }

  async updateBusiness(businessId: string, data: Partial<BusinessCreate>): Promise<BusinessResponse> {
    return this.update(businessId, data);
  }
}
