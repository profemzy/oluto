/**
 * Accounts API - Chart of accounts management
 */
import { ApiClient } from './client';
import type { Account, AccountCreate, AccountUpdate } from './types';

export class AccountsApi extends ApiClient {
  async listAccounts(businessId: string): Promise<Account[]> {
    return this.request<Account[]>(`/businesses/${businessId}/accounts`);
  }

  // Alias for backward compatibility
  async list(businessId: string): Promise<Account[]> {
    return this.listAccounts(businessId);
  }

  async getAccount(businessId: string, accountId: string): Promise<Account> {
    return this.request<Account>(`/businesses/${businessId}/accounts/${accountId}`);
  }

  // Alias for backward compatibility
  async get(businessId: string, accountId: string): Promise<Account> {
    return this.getAccount(businessId, accountId);
  }

  async createAccount(businessId: string, data: AccountCreate): Promise<Account> {
    return this.request<Account>(`/businesses/${businessId}/accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Alias for backward compatibility
  async create(businessId: string, data: AccountCreate): Promise<Account> {
    return this.createAccount(businessId, data);
  }

  async updateAccount(businessId: string, accountId: string, data: AccountUpdate): Promise<Account> {
    return this.request<Account>(`/businesses/${businessId}/accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Alias for backward compatibility
  async update(businessId: string, accountId: string, data: AccountUpdate): Promise<Account> {
    return this.updateAccount(businessId, accountId, data);
  }

  async deactivateAccount(businessId: string, accountId: string): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  // Alias for backward compatibility
  async deactivate(businessId: string, accountId: string): Promise<void> {
    return this.deactivateAccount(businessId, accountId);
  }

  // Alias for backward compatibility
  async delete(businessId: string, accountId: string): Promise<void> {
    return this.deactivateAccount(businessId, accountId);
  }
}
