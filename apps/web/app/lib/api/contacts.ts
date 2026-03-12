/**
 * Contacts API - Customer, vendor, and employee management
 */
import { ApiClient } from './client';
import type { Contact, ContactCreate, ContactUpdate } from './types';

export class ContactsApi extends ApiClient {
  async listContacts(businessId: string): Promise<Contact[]> {
    return this.request<Contact[]>(`/businesses/${businessId}/contacts`);
  }

  // Alias for backward compatibility
  async list(businessId: string): Promise<Contact[]> {
    return this.listContacts(businessId);
  }

  async getCustomers(businessId: string): Promise<Contact[]> {
    return this.request<Contact[]>(`/businesses/${businessId}/contacts/customers`);
  }

  async getVendors(businessId: string): Promise<Contact[]> {
    return this.request<Contact[]>(`/businesses/${businessId}/contacts/vendors`);
  }

  async getEmployees(businessId: string): Promise<Contact[]> {
    return this.request<Contact[]>(`/businesses/${businessId}/contacts/employees`);
  }

  async getContact(businessId: string, contactId: string): Promise<Contact> {
    return this.request<Contact>(`/businesses/${businessId}/contacts/${contactId}`);
  }

  // Alias for backward compatibility
  async get(businessId: string, contactId: string): Promise<Contact> {
    return this.getContact(businessId, contactId);
  }

  async createContact(businessId: string, data: ContactCreate): Promise<Contact> {
    return this.request<Contact>(`/businesses/${businessId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Alias for backward compatibility
  async create(businessId: string, data: ContactCreate): Promise<Contact> {
    return this.createContact(businessId, data);
  }

  async updateContact(businessId: string, contactId: string, data: ContactUpdate): Promise<Contact> {
    return this.request<Contact>(`/businesses/${businessId}/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Alias for backward compatibility
  async update(businessId: string, contactId: string, data: ContactUpdate): Promise<Contact> {
    return this.updateContact(businessId, contactId, data);
  }

  async deleteContact(businessId: string, contactId: string): Promise<void> {
    await this.request<Record<string, never>>(`/businesses/${businessId}/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // Alias for backward compatibility
  async delete(businessId: string, contactId: string): Promise<void> {
    return this.deleteContact(businessId, contactId);
  }
}
