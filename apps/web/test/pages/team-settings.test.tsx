import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TeamSettingsPage from "@/app/settings/team/page";
import { api } from "@/app/lib/api";

vi.mock("@/app/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      email: "owner@example.com",
      full_name: "Alex Owner",
      role: "admin",
      is_active: true,
      business_id: "business-1",
    },
    loading: false,
    timezone: "America/Toronto",
    role: "owner",
    canWrite: true,
    canAdmin: true,
    canManageMemberships: true,
  }),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TeamSettingsPage />
    </QueryClientProvider>
  );
}

describe("TeamSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api.memberships, "list").mockResolvedValue([
      {
        id: "membership-1",
        business_id: "business-1",
        user_id: "user-1",
        email: "owner@example.com",
        full_name: "Alex Owner",
        role: "owner",
        status: "active",
        version: 2,
        activated_at: "2026-09-01T12:00:00Z",
      },
      {
        id: "membership-2",
        business_id: "business-1",
        user_id: "user-2",
        email: "team@example.com",
        full_name: "Taylor Team",
        role: "viewer",
        status: "active",
        version: 6,
        activated_at: "2026-09-02T12:00:00Z",
      },
    ]);
    vi.spyOn(api.memberships, "listInvitations").mockResolvedValue([
      {
        id: "invitation-1",
        business_id: "business-1",
        email: "bookkeeper@example.com",
        role: "accountant",
        status: "pending",
        version: 1,
        invited_by: "user-1",
        expires_at: "2026-09-26T12:00:00Z",
        accepted_at: null,
        revoked_at: null,
        created_at: "2026-09-19T12:00:00Z",
        delivery: {
          status: "dead_letter",
          version: 4,
          attempt_count: 8,
          attempts_in_cycle: 8,
          manual_retry_count: 0,
          available_at: "2026-09-19T13:00:00Z",
          last_error: "Mail server unavailable",
          delivered_at: null,
          last_retried_at: null,
        },
      },
    ]);
    vi.spyOn(api.memberships, "listAuditEvents").mockResolvedValue({
      items: [
        {
          sequence: 42,
          id: "audit-1",
          business_id: "business-1",
          event_type: "invitation_delivery_retried",
          actor_user_id: "user-1",
          actor_email: "owner@example.com",
          subject_user_id: null,
          membership_id: null,
          invitation_id: "invitation-1",
          before_state: null,
          after_state: null,
          metadata: {},
          occurred_at: "2026-09-19T14:00:00Z",
        },
      ],
      next_cursor: null,
    });
    vi.spyOn(api.memberships, "retryInvitationDelivery").mockResolvedValue({
      status: "pending",
      version: 5,
      attempt_count: 8,
      attempts_in_cycle: 0,
      manual_retry_count: 1,
      available_at: "2026-09-19T14:00:00Z",
      last_error: null,
      delivered_at: null,
      last_retried_at: "2026-09-19T14:00:00Z",
    });
    vi.spyOn(api.memberships, "invite").mockResolvedValue({
      id: "invitation-2",
      business_id: "business-1",
      email: "new-member@example.com",
      role: "contributor",
      version: 1,
      expires_at: "2026-09-26T12:00:00Z",
      acceptance_token: "token",
    });
    vi.spyOn(api.memberships, "revokeInvitation").mockResolvedValue({
      id: "invitation-1",
      business_id: "business-1",
      email: "bookkeeper@example.com",
      role: "accountant",
      status: "revoked",
      version: 2,
      invited_by: "user-1",
      expires_at: "2026-09-26T12:00:00Z",
      accepted_at: null,
      revoked_at: "2026-09-19T14:00:00Z",
      created_at: "2026-09-19T12:00:00Z",
    });
    vi.spyOn(api.memberships, "update").mockResolvedValue({
      id: "membership-2",
      business_id: "business-1",
      user_id: "user-2",
      email: "team@example.com",
      full_name: "Taylor Team",
      role: "accountant",
      status: "active",
      version: 7,
      activated_at: "2026-09-02T12:00:00Z",
    });
  });

  it("shows members, invitation delivery failures, and retries through the public action", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: "Team & access" })).toBeInTheDocument();
    expect(screen.getByText("Alex Owner")).toBeInTheDocument();
    expect(screen.getByText("bookkeeper@example.com")).toBeInTheDocument();
    expect(screen.getByText("Mail server unavailable")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry delivery" }));

    await waitFor(() => {
      expect(api.memberships.retryInvitationDelivery).toHaveBeenCalledWith(
        "business-1",
        "invitation-1",
        4
      );
    });
  });

  it("invites a member with an explicit business role", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Team & access" });

    fireEvent.click(screen.getByRole("button", { name: "Invite member" }));
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "new-member@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Business role"), {
      target: { value: "contributor" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send invitation" }));

    await waitFor(() => {
      expect(api.memberships.invite).toHaveBeenCalledWith("business-1", {
        email: "new-member@example.com",
        role: "contributor",
      });
    });
  });

  it("requires confirmation before revoking a pending invitation", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Team & access" });

    fireEvent.click(screen.getByRole("button", { name: "Revoke invitation" }));
    expect(api.memberships.revokeInvitation).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm revoke" }));

    await waitFor(() => {
      expect(api.memberships.revokeInvitation).toHaveBeenCalledWith(
        "business-1",
        "invitation-1",
        1
      );
    });
  });

  it("updates a member role with optimistic version checking", async () => {
    renderPage();
    await screen.findByText("Taylor Team");

    fireEvent.change(screen.getByLabelText("Role for Taylor Team"), {
      target: { value: "accountant" },
    });

    await waitFor(() => {
      expect(api.memberships.update).toHaveBeenCalledWith("business-1", "membership-2", {
        role: "accountant",
        expected_version: 6,
      });
    });
  });

  it("suspends a member with optimistic version checking", async () => {
    renderPage();
    await screen.findByText("Taylor Team");

    fireEvent.change(screen.getByLabelText("Status for Taylor Team"), {
      target: { value: "suspended" },
    });

    await waitFor(() => {
      expect(api.memberships.update).toHaveBeenCalledWith("business-1", "membership-2", {
        status: "suspended",
        expected_version: 6,
      });
    });
  });

  it("requires confirmation before revoking a member", async () => {
    renderPage();
    await screen.findByText("Taylor Team");

    fireEvent.click(screen.getByRole("button", { name: "Remove access for Taylor Team" }));
    expect(api.memberships.update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm remove Taylor Team" }));

    await waitFor(() => {
      expect(api.memberships.update).toHaveBeenCalledWith("business-1", "membership-2", {
        status: "revoked",
        expected_version: 6,
      });
    });
  });

  it("shows the membership audit history", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: "Access history" })).toBeInTheDocument();
    expect(screen.getByText("Invitation delivery retried")).toBeInTheDocument();
    expect(screen.getByText("By owner@example.com")).toBeInTheDocument();
  });
});
