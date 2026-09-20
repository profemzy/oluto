"use client";

import { type FormEvent, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorAlert, ListPageLayout, ListSkeleton } from "@/app/components";
import { useAuth } from "@/app/hooks/useAuth";
import {
  api,
  type MembershipAuditEvent,
  type MembershipInvitation,
  type Membership,
  type MembershipRole,
  type MembershipStatus,
} from "@/app/lib/api";

const auditEventLabels: Record<MembershipAuditEvent["event_type"], string> = {
  membership_created: "Membership created",
  invitation_created: "Invitation created",
  invitation_accepted: "Invitation accepted",
  invitation_revoked: "Invitation revoked",
  invitation_expired: "Invitation expired",
  invitation_delivery_retried: "Invitation delivery retried",
  membership_updated: "Membership updated",
  ownership_transferred: "Ownership transferred",
};

const roleLabels: Record<MembershipRole, string> = {
  owner: "Owner",
  administrator: "Administrator",
  accountant: "Accountant",
  contributor: "Contributor",
  viewer: "Viewer",
};

const statusStyles: Record<MembershipStatus, string> = {
  invited:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",
  active:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800",
  suspended:
    "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-800",
  revoked: "bg-surface-tertiary text-muted ring-edge",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function deliveryLabel(invitation: MembershipInvitation): string {
  if (invitation.delivery.status === "dead_letter") return "Delivery failed";
  if (invitation.delivery.status === "delivered") return "Delivered";
  if (invitation.delivery.status === "processing") return "Sending";
  if (invitation.delivery.status === "cancelled") return "Cancelled";
  if (invitation.delivery.last_error) return "Retry scheduled";
  return "Queued";
}

function isRetryable(invitation: MembershipInvitation): boolean {
  return (
    invitation.status === "pending" &&
    (invitation.delivery.status === "dead_letter" ||
      (invitation.delivery.status === "pending" && !!invitation.delivery.last_error))
  );
}

export default function TeamSettingsPage() {
  const { user, loading: authLoading, canManageMemberships } = useAuth();
  const queryClient = useQueryClient();
  const businessId = user?.business_id;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Exclude<MembershipRole, "owner">>("viewer");
  const [revokeConfirmationId, setRevokeConfirmationId] = useState<string | null>(null);
  const [memberRevokeConfirmationId, setMemberRevokeConfirmationId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [membersQuery, invitationsQuery] = [
    useQuery({
      queryKey: ["memberships", businessId],
      queryFn: () => api.memberships.list(businessId!),
      enabled: !!businessId && canManageMemberships,
    }),
    useQuery({
      queryKey: ["membership-invitations", businessId],
      queryFn: () => api.memberships.listInvitations(businessId!),
      enabled: !!businessId && canManageMemberships,
    }),
  ];
  const auditQuery = useInfiniteQuery({
    queryKey: ["membership-audit-events", businessId],
    queryFn: ({ pageParam }) => api.memberships.listAuditEvents(businessId!, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: !!businessId && canManageMemberships,
  });

  const retryMutation = useMutation({
    mutationFn: (invitation: MembershipInvitation) =>
      api.memberships.retryInvitationDelivery(
        businessId!,
        invitation.id,
        invitation.delivery.version
      ),
    onSuccess: () => {
      setSuccessMessage("Invitation delivery returned to the queue.");
      queryClient.invalidateQueries({ queryKey: ["membership-invitations", businessId] });
      queryClient.invalidateQueries({ queryKey: ["membership-audit-events", businessId] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      api.memberships.invite(businessId!, {
        email: inviteEmail.trim(),
        role: inviteRole,
      }),
    onSuccess: () => {
      setSuccessMessage(`Invitation sent to ${inviteEmail.trim()}.`);
      setInviteEmail("");
      setInviteRole("viewer");
      setInviteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["membership-invitations", businessId] });
      queryClient.invalidateQueries({ queryKey: ["membership-audit-events", businessId] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (invitation: MembershipInvitation) =>
      api.memberships.revokeInvitation(businessId!, invitation.id, invitation.version),
    onSuccess: () => {
      setSuccessMessage("Invitation revoked.");
      setRevokeConfirmationId(null);
      queryClient.invalidateQueries({ queryKey: ["membership-invitations", businessId] });
      queryClient.invalidateQueries({ queryKey: ["membership-audit-events", businessId] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ member, role }: { member: Membership; role: MembershipRole }) =>
      api.memberships.update(businessId!, member.id, {
        role,
        expected_version: member.version,
      }),
    onSuccess: () => {
      setSuccessMessage("Member role updated.");
      queryClient.invalidateQueries({ queryKey: ["memberships", businessId] });
      queryClient.invalidateQueries({ queryKey: ["membership-audit-events", businessId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ member, status }: { member: Membership; status: MembershipStatus }) =>
      api.memberships.update(businessId!, member.id, {
        status,
        expected_version: member.version,
      }),
    onSuccess: (_, variables) => {
      setSuccessMessage(
        variables.status === "revoked"
          ? "Member access removed."
          : `Member ${variables.status === "active" ? "reactivated" : "suspended"}.`
      );
      setMemberRevokeConfirmationId(null);
      queryClient.invalidateQueries({ queryKey: ["memberships", businessId] });
      queryClient.invalidateQueries({ queryKey: ["membership-audit-events", businessId] });
    },
  });

  const submitInvitation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    inviteMutation.mutate();
  };

  if (authLoading || membersQuery.isLoading || invitationsQuery.isLoading || auditQuery.isLoading) {
    return <ListSkeleton title="Team & access" rowCount={5} />;
  }

  if (!canManageMemberships) {
    return (
      <ListPageLayout title="Team & access" subtitle="Business membership administration">
        <div className="border-edge bg-surface rounded-2xl border p-8 text-center shadow-sm">
          <h2 className="text-heading text-lg font-bold">Administrator access required</h2>
          <p className="text-muted mx-auto mt-2 max-w-lg text-sm">
            Only business owners and administrators can manage memberships and invitations.
          </p>
        </div>
      </ListPageLayout>
    );
  }

  const members = membersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];
  const auditEvents = auditQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const error =
    membersQuery.error ??
    invitationsQuery.error ??
    retryMutation.error ??
    inviteMutation.error ??
    revokeMutation.error ??
    updateRoleMutation.error ??
    updateStatusMutation.error ??
    auditQuery.error;

  return (
    <ListPageLayout
      title="Team & access"
      subtitle={`${members.filter((member) => member.status === "active").length} active member${
        members.filter((member) => member.status === "active").length === 1 ? "" : "s"
      }`}
    >
      <ErrorAlert error={error instanceof Error ? error.message : ""} />
      <p aria-live="polite" className="sr-only">
        {successMessage}
      </p>

      <section aria-labelledby="members-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-cyan-600 uppercase">
              Access roster
            </p>
            <h2 id="members-heading" className="text-heading mt-1 text-xl font-black">
              Members
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen((open) => !open)}
            aria-expanded={inviteOpen}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Invite member
          </button>
        </div>

        {inviteOpen && (
          <form
            onSubmit={submitInvitation}
            className="mb-5 grid gap-4 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.45fr)_auto] sm:items-end dark:border-cyan-900 dark:bg-cyan-950/30"
          >
            <label className="block">
              <span className="text-heading mb-1.5 block text-sm font-bold">Email address</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="person@example.com"
                className="bg-surface text-heading min-h-11 w-full rounded-xl border-0 px-3.5 py-2 text-sm shadow-sm ring-1 ring-[var(--color-ring-default)] ring-inset focus:ring-2 focus:ring-cyan-600"
              />
            </label>
            <label className="block">
              <span className="text-heading mb-1.5 block text-sm font-bold">Business role</span>
              <select
                value={inviteRole}
                onChange={(event) =>
                  setInviteRole(event.target.value as Exclude<MembershipRole, "owner">)
                }
                className="bg-surface text-heading min-h-11 w-full rounded-xl border-0 px-3.5 py-2 text-sm shadow-sm ring-1 ring-[var(--color-ring-default)] ring-inset focus:ring-2 focus:ring-cyan-600"
              >
                <option value="administrator">Administrator</option>
                <option value="accountant">Accountant</option>
                <option value="contributor">Contributor</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={inviteMutation.isPending || !inviteEmail.trim()}
              className="min-h-11 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {inviteMutation.isPending ? "Sending…" : "Send invitation"}
            </button>
          </form>
        )}

        <div className="border-edge bg-surface overflow-hidden rounded-2xl border shadow-sm">
          {members.length === 0 ? (
            <p className="text-muted p-8 text-center text-sm">No business memberships found.</p>
          ) : (
            <ul className="divide-edge-subtle divide-y">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-heading truncate font-bold">
                      {member.full_name || member.email}
                    </p>
                    <p className="text-muted truncate text-sm">{member.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label>
                      <span className="sr-only">Role for {member.full_name || member.email}</span>
                      <select
                        value={member.role}
                        onChange={(event) =>
                          updateRoleMutation.mutate({
                            member,
                            role: event.target.value as MembershipRole,
                          })
                        }
                        disabled={updateRoleMutation.isPending}
                        className="min-h-10 rounded-xl border-0 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 ring-1 ring-cyan-200 ring-inset focus:ring-2 focus:ring-cyan-600 disabled:opacity-60 dark:bg-cyan-950 dark:text-cyan-300 dark:ring-cyan-800"
                      >
                        {Object.entries(roleLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {member.role === "owner" ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[member.status]}`}
                      >
                        {member.status[0].toUpperCase() + member.status.slice(1)}
                      </span>
                    ) : (
                      <label>
                        <span className="sr-only">
                          Status for {member.full_name || member.email}
                        </span>
                        <select
                          value={member.status}
                          onChange={(event) =>
                            updateStatusMutation.mutate({
                              member,
                              status: event.target.value as MembershipStatus,
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          className={`min-h-10 rounded-xl border-0 px-3 py-1 text-xs font-bold ring-1 ring-inset focus:ring-2 focus:ring-cyan-600 disabled:opacity-60 ${statusStyles[member.status]}`}
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </label>
                    )}
                    {member.role !== "owner" &&
                      member.status !== "revoked" &&
                      (memberRevokeConfirmationId === member.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMemberRevokeConfirmationId(null)}
                            className="text-body hover:bg-surface-hover min-h-10 rounded-xl px-3 py-1 text-xs font-bold transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateStatusMutation.mutate({ member, status: "revoked" })
                            }
                            disabled={updateStatusMutation.isPending}
                            aria-label={`Confirm remove ${member.full_name || member.email}`}
                            className="min-h-10 rounded-xl bg-red-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                          >
                            Confirm remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setMemberRevokeConfirmationId(member.id)}
                          aria-label={`Remove access for ${member.full_name || member.email}`}
                          className="min-h-10 rounded-xl px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          Remove access
                        </button>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="invitations-heading" className="mt-10">
        <div className="mb-4">
          <p className="text-xs font-bold tracking-[0.18em] text-cyan-600 uppercase">
            Pending access
          </p>
          <h2 id="invitations-heading" className="text-heading mt-1 text-xl font-black">
            Invitations
          </h2>
        </div>

        <div className="space-y-3">
          {invitations.length === 0 ? (
            <div className="border-edge bg-surface rounded-2xl border border-dashed p-8 text-center">
              <p className="text-heading font-semibold">No invitations yet</p>
              <p className="text-muted mt-1 text-sm">
                Invite a trusted collaborator when you are ready.
              </p>
            </div>
          ) : (
            invitations.map((invitation) => (
              <article
                key={invitation.id}
                className="border-edge bg-surface rounded-2xl border p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-heading truncate font-bold">{invitation.email}</h3>
                      <span className="bg-surface-tertiary text-body rounded-full px-2.5 py-1 text-xs font-bold">
                        {roleLabels[invitation.role]}
                      </span>
                    </div>
                    <p className="text-muted mt-1 text-sm">
                      {deliveryLabel(invitation)} · Expires {formatDate(invitation.expires_at)}
                    </p>
                    {invitation.delivery.last_error && (
                      <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                        {invitation.delivery.last_error}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isRetryable(invitation) && (
                      <button
                        type="button"
                        onClick={() => retryMutation.mutate(invitation)}
                        disabled={retryMutation.isPending}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-wait disabled:opacity-60"
                      >
                        {retryMutation.isPending ? "Retrying…" : "Retry delivery"}
                      </button>
                    )}
                    {invitation.status === "pending" &&
                      (revokeConfirmationId === invitation.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setRevokeConfirmationId(null)}
                            className="text-body hover:bg-surface-hover min-h-11 rounded-xl px-3 py-2 text-sm font-bold transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => revokeMutation.mutate(invitation)}
                            disabled={revokeMutation.isPending}
                            className="min-h-11 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                          >
                            {revokeMutation.isPending ? "Revoking…" : "Confirm revoke"}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRevokeConfirmationId(invitation.id)}
                          className="min-h-11 rounded-xl px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          Revoke invitation
                        </button>
                      ))}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section aria-labelledby="access-history-heading" className="mt-10">
        <div className="mb-4">
          <p className="text-xs font-bold tracking-[0.18em] text-cyan-600 uppercase">
            Accountability
          </p>
          <h2 id="access-history-heading" className="text-heading mt-1 text-xl font-black">
            Access history
          </h2>
        </div>

        <div className="border-edge bg-surface overflow-hidden rounded-2xl border shadow-sm">
          {auditEvents.length === 0 ? (
            <p className="text-muted p-8 text-center text-sm">No access changes recorded yet.</p>
          ) : (
            <ol className="divide-edge-subtle divide-y">
              {auditEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:justify-between sm:gap-6"
                >
                  <div>
                    <p className="text-heading font-bold">{auditEventLabels[event.event_type]}</p>
                    <p className="text-muted text-sm">
                      {event.actor_email ? `By ${event.actor_email}` : "System action"}
                    </p>
                  </div>
                  <time className="text-muted shrink-0 text-sm" dateTime={event.occurred_at}>
                    {formatDate(event.occurred_at)}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </div>
        {auditQuery.hasNextPage && (
          <button
            type="button"
            onClick={() => auditQuery.fetchNextPage()}
            disabled={auditQuery.isFetchingNextPage}
            className="border-edge bg-surface text-heading hover:bg-surface-hover mt-4 min-h-11 rounded-xl border px-4 py-2 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60"
          >
            {auditQuery.isFetchingNextPage ? "Loading…" : "Load older activity"}
          </button>
        )}
      </section>
    </ListPageLayout>
  );
}
