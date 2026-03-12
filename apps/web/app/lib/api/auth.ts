/**
 * Auth API - Authentication and user management
 */
import { ApiClient } from './client';
import type { User } from './types';

export class AuthApi extends ApiClient {
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }
}
