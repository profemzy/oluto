import { ApiClient } from "./client";
import type {
  CreateMembershipInvitation,
  Membership,
  MembershipAuditPage,
  MembershipInvitation,
  MembershipInvitationCreated,
  MembershipInvitationDelivery,
  MembershipInvitationSummary,
  UpdateMembership,
} from "./types";

export class MembershipsApi extends ApiClient {
  async list(businessId: string): Promise<Membership[]> {
    return this.request<Membership[]>(`/businesses/${businessId}/memberships`);
  }

  async update(
    businessId: string,
    membershipId: string,
    data: UpdateMembership
  ): Promise<Membership> {
    return this.request<Membership>(`/businesses/${businessId}/memberships/${membershipId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async listInvitations(businessId: string): Promise<MembershipInvitation[]> {
    return this.request<MembershipInvitation[]>(`/businesses/${businessId}/membership-invitations`);
  }

  async invite(
    businessId: string,
    data: CreateMembershipInvitation
  ): Promise<MembershipInvitationCreated> {
    return this.request<MembershipInvitationCreated>(
      `/businesses/${businessId}/membership-invitations`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async revokeInvitation(
    businessId: string,
    invitationId: string,
    expectedVersion: number
  ): Promise<MembershipInvitationSummary> {
    return this.request<MembershipInvitationSummary>(
      `/businesses/${businessId}/membership-invitations/${invitationId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ expected_version: expectedVersion }),
      }
    );
  }

  async retryInvitationDelivery(
    businessId: string,
    invitationId: string,
    expectedVersion: number
  ): Promise<MembershipInvitationDelivery> {
    return this.request<MembershipInvitationDelivery>(
      `/businesses/${businessId}/membership-invitations/${invitationId}/delivery/retry`,
      {
        method: "POST",
        body: JSON.stringify({ expected_version: expectedVersion }),
      }
    );
  }

  async listAuditEvents(businessId: string, beforeSequence?: number): Promise<MembershipAuditPage> {
    const query = this.buildQueryString({ limit: 50, before_sequence: beforeSequence });
    return this.request<MembershipAuditPage>(
      `/businesses/${businessId}/membership-audit-events${query}`
    );
  }
}
