/**
 * Accounts API - Chart of accounts management
 */
import { ApiClient } from './client';
import type { Account, AccountCreate, AccountUpdate } from './types';

export class AccountsApi extends ApiClient {
  async listAccounts(businessId: string): Promise<Account[]> {
    return this.request<Account[]>(`/businesses/${businessId}/accounts`);
  }

  async getAccount(businessId: string, accountId: string): Promise<Account> {
    return this.request<Account>(`/businesses/${businessId}/accounts/${accountId}`);
  }

  async createAccount(businessId: string, data: AccountCreate): Promise<Account> {
    return this.request<Account>(`/businesses/${businessId}/accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccount(businessId: string, accountId: string, data: AccountUpdate): Promise<Account> {
    return this.request<Account>(`/businesses/${businessId}/accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deactivateAccount(businessId: string, accountId: string): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }
}
