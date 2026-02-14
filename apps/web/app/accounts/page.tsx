"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Account } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, ErrorAlert, ListPageLayout } from "@/app/components";
import { useDataTable } from "@/app/hooks/useDataTable";
import { toastError, toastSuccess } from "@/app/lib/toast";
import { ACCOUNT_TYPE_COLORS, ACCOUNT_TYPE_FILTERS } from "@/app/lib/status";

export default function AccountsPage() {
  const { loading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: accounts,
    loading,
    error,
    filter: typeFilter,
    setFilter: setTypeFilter,
  } = useDataTable<Account>({
    queryKey: ["accounts"],
    queryFn: () => api.listAccounts(user.business_id!),
    filterParam: "type",
    defaultFilter: "",
    enabled: !authLoading,
    clientSideFilter: true,
  });

  const filtered = typeFilter
    ? accounts.filter((a) => a.account_type === typeFilter)
    : accounts;

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.deactivateAccount(user.business_id!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toastSuccess("Account deactivated");
    },
    onError: (err) => {
      toastError(
        err instanceof Error ? err.message : "Failed to deactivate account",
      );
    },
  });

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this account?")) return;
    deactivateMutation.mutate(id);
  };

  if (authLoading || loading) return <PageLoader />;

  return (
    <ListPageLayout
      title="Chart of Accounts"
      subtitle={`${filtered.length} account${filtered.length === 1 ? "" : "s"}`}

    >
      <ErrorAlert error={error} className="mb-6" />
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border-0 py-2.5 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm bg-surface"
        >
          {ACCOUNT_TYPE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <Link
          href="/accounts/new"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Account
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-12 text-center">
          <h3 className="text-lg font-bold text-heading mb-2">
            No accounts yet
          </h3>
          <p className="text-sm text-muted mb-6">
            Set up your chart of accounts to start tracking finances.
          </p>
          <Link
            href="/accounts/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md"
          >
            Add Account
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge text-xs font-bold text-muted uppercase tracking-wider">
            <div className="col-span-2">Code</div>
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2"></div>
          </div>
          <div className="divide-y divide-edge-subtle">
            {filtered.map((account) => (
              <div
                key={account.id}
                className={`group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/50 transition-all items-center ${!account.is_active ? "opacity-50" : ""}`}
              >
                <div className="col-span-2">
                  <p className="text-sm font-mono font-bold text-heading">
                    {account.code}
                  </p>
                </div>
                <div className="col-span-4">
                  <p className="text-sm font-bold text-heading">
                    {account.parent_account_id && (
                      <span className="text-caption mr-1">{"\u2514"}</span>
                    )}
                    {account.name}
                  </p>
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${ACCOUNT_TYPE_COLORS[account.account_type] || "bg-surface-tertiary text-body"}`}
                  >
                    {account.account_type}
                  </span>
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${account.is_active ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700" : "bg-surface-tertiary text-muted"}`}
                  >
                    {account.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-1">
                  <Link
                    href={`/accounts/${account.id}/edit`}
                    className="p-2 rounded-lg text-caption hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-all"
                    title="Edit account"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>
                  {account.is_active && (
                    <button
                      onClick={() => handleDeactivate(account.id)}
                      className="p-2 rounded-lg text-caption hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                      title="Deactivate account"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ListPageLayout>
  );
}
