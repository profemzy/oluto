/**
 * Auth API - Authentication and user management
 */
import { ApiClient } from "./client";
import type { BusinessAuthContext, User } from "./types";

export class AuthApi extends ApiClient {
  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async getBusinessContext(businessId: string): Promise<BusinessAuthContext> {
    return this.request<BusinessAuthContext>(`/businesses/${businessId}/auth-context`);
  }
}
