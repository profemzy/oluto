"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Account } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { ListSkeleton, ErrorAlert, ListPageLayout, DataTable, DataTableColumn, DataTableAction } from "@/app/components";
import { useDataTable } from "@/app/hooks/useDataTable";
import { toastError, toastSuccess } from "@/app/lib/toast";
import { ACCOUNT_TYPE_COLORS, ACCOUNT_TYPE_FILTERS } from "@/app/lib/status";

export default function AccountsPage() {
  const { loading: authLoading, user, canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: accounts,
    loading,
    error,
    filter: typeFilter,
    setFilter: setTypeFilter,
  } = useDataTable<Account>({
    queryKey: ["accounts", user?.business_id],
    queryFn: () => api.listAccounts(user.business_id!),
    filterParam: "type",
    defaultFilter: "",
    enabled: !authLoading && !!user?.business_id,
    clientSideFilter: true,
  });

  // Filter accounts based on type and search
  const filteredAccounts = useMemo(() => {
    let result = typeFilter
      ? accounts?.filter((a) => a.account_type === typeFilter) || []
      : (accounts || []);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.code?.toLowerCase().includes(q) ?? false)
      );
    }

    return result;
  }, [accounts, typeFilter, searchQuery]);

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.deactivateAccount(user!.business_id!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toastSuccess("Account deactivated");
    },
    onError: (err) => {
      toastError(err instanceof Error ? err.message : "Failed to deactivate account");
    },
  });

  // Define table columns
  const columns: DataTableColumn<Account>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Code",
        width: "100px",
        sortable: true,
        render: (account) => (
          <span className="text-sm font-mono font-bold text-heading">{account.code}</span>
        ),
      },
      {
        key: "name",
        header: "Name",
        width: "2fr",
        sortable: true,
        render: (account) => (
          <span className="font-semibold text-heading">
            {account.parent_account_id && (
              <span className="text-caption mr-1">{"└"}</span>
            )}
            {account.name}
          </span>
        ),
      },
      {
        key: "account_type",
        header: "Type",
        width: "130px",
        sortable: true,
        render: (account) => (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
              ACCOUNT_TYPE_COLORS[account.account_type] || "bg-surface-tertiary text-body"
            }`}
          >
            {account.account_type}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "100px",
        render: (account) => (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
              account.is_active
                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700"
                : "bg-surface-tertiary text-muted"
            }`}
          >
            {account.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    []
  );

  // Define table actions
  const actions: DataTableAction<Account>[] = useMemo(
    () => [
      {
        key: "edit",
        label: "Edit account",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        href: (account) => `/accounts/${account.id}/edit`,
        variant: "primary",
      },
      {
        key: "deactivate",
        label: "Deactivate account",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ),
        onClick: (account) => {
          if (confirm("Deactivate this account?")) {
            deactivateMutation.mutate(account.id);
          }
        },
        variant: "danger",
        show: (account) => account.is_active,
      },
    ],
    [deactivateMutation]
  );

  if (authLoading || loading) {
    return <ListSkeleton title="Accounts" actionButton rowCount={6} />;
  }

  return (
    <ListPageLayout
      title="Chart of Accounts"
      subtitle={`${filteredAccounts.length} account${filteredAccounts.length === 1 ? "" : "s"}`}
    >
      <ErrorAlert error={error} className="mb-6" />

      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border-0 py-2.5 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm bg-surface"
          >
            {ACCOUNT_TYPE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          {typeFilter && (
            <button
              onClick={() => setTypeFilter("")}
              className="text-sm text-muted hover:text-heading transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {canWrite && (
          <Link
            href="/accounts/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Account
          </Link>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredAccounts}
        keyExtractor={(account) => account.id}
        actions={canWrite ? actions : []}
        searchFields={["name", "code"]}
        searchPlaceholder="Search by name or code..."
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        loading={loading}
        pageSize={25}
        rowClassName={(account) => (!account.is_active ? "opacity-50" : "")}
        emptyState={{
          title: "No accounts yet",
          description: canWrite ? "Set up your chart of accounts to start tracking finances." : "No accounts have been set up yet.",
          action: canWrite ? { label: "Add Account", href: "/accounts/new" } : undefined,
        }}
        noResultsState={{
          title: "No accounts match your search",
          description: "Try adjusting your search terms.",
          onClearFilters: () => {
            setSearchQuery("");
            setTypeFilter("");
          },
        }}
      />
    </ListPageLayout>
  );
}
