"use client";

import Link from "next/link";
import { Suspense, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  Transaction,
  TransactionListParams,
  BulkStatusUpdateResponse,
} from "@/app/lib/api";
import {
  formatCurrency,
  formatDate,
  todayInTimezone,
  dateOffsetInTimezone,
  firstOfYearInTimezone,
} from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { ListSkeleton, ErrorAlert, ListPageLayout, DataTable, DataTableColumn, DataTableAction, FilterBar } from "@/app/components";
import { useDataTable } from "@/app/hooks/useDataTable";
import { toastError, toastSuccess } from "@/app/lib/toast";
import {
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_STATUS_COLORS,
  VALID_TRANSITIONS,
} from "@/app/lib/status";
import { CRA_CATEGORIES, CLASSIFICATION_OPTIONS } from "@/app/lib/constants";

const DATE_PRESETS = [
  { value: "all", label: "All Time" },
  { value: "this_month", label: "This Month" },
  { value: "last_30", label: "Last 30 Days" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
] as const;

const ALL_CLASSIFICATIONS = [
  ...CLASSIFICATION_OPTIONS.credit,
  ...CLASSIFICATION_OPTIONS.debit,
];

function getDateRange(preset: string): { start_date?: string; end_date?: string } {
  const today = todayInTimezone();
  switch (preset) {
    case "this_month": {
      const [y, m] = today.split("-");
      return { start_date: `${y}-${m}-01`, end_date: today };
    }
    case "last_30":
      return { start_date: dateOffsetInTimezone(-30), end_date: today };
    case "this_quarter": {
      const [y, m] = today.split("-");
      const qMonth = Math.floor((parseInt(m) - 1) / 3) * 3 + 1;
      const qm = String(qMonth).padStart(2, "0");
      return { start_date: `${y}-${qm}-01`, end_date: today };
    }
    case "this_year":
      return { start_date: firstOfYearInTimezone(), end_date: today };
    default:
      return {};
  }
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<ListSkeleton title="Transactions" actionButton />}>
      <TransactionsContent />
    </Suspense>
  );
}

function TransactionsContent() {
  const { user, loading: authLoading, canWrite, canAdmin } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const dateParams = useMemo(() => {
    if (datePreset === "custom") {
      const params: Record<string, string> = {};
      if (customStartDate) params.start_date = customStartDate;
      if (customEndDate) params.end_date = customEndDate;
      return params;
    }
    return getDateRange(datePreset);
  }, [datePreset, customStartDate, customEndDate]);

  const listTransactions = () => {
    if (!user?.business_id) return Promise.resolve([] as Transaction[]);
    const apiParams: TransactionListParams = {};
    if (dateParams.start_date) apiParams.start_date = dateParams.start_date;
    if (dateParams.end_date) apiParams.end_date = dateParams.end_date;
    return api.listTransactions(user.business_id, apiParams);
  };

  const dateKey = (dateParams.start_date ?? "") + (dateParams.end_date ?? "");

  const {
    data: transactions,
    loading,
    error,
    filter: statusFilter,
    setFilter: setStatusFilter,
  } = useDataTable<Transaction>({
    queryKey: ["transactions", user?.business_id ?? "", dateKey],
    queryFn: listTransactions,
    defaultFilter: initialStatus,
    enabled: !!user?.business_id,
    clientSideFilter: true,
  });

  // Client-side filtering
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.vendor_name?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (categoryFilter) {
      result = result.filter((t) =>
        categoryFilter === "uncategorized" ? !t.category : t.category === categoryFilter
      );
    }

    if (classificationFilter) {
      result = result.filter((t) => t.classification === classificationFilter);
    }

    return result;
  }, [transactions, searchQuery, statusFilter, categoryFilter, classificationFilter]);

  // Summary stats
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const t of filteredTransactions) {
      const amt = parseFloat(t.amount);
      if (t.classification === "business_income") income += amt;
      else if (t.classification === "business_expense") expenses += amt;
    }
    return { income, expenses, net: income - expenses, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter) count++;
    if (categoryFilter) count++;
    if (classificationFilter) count++;
    if (datePreset !== "all") count++;
    return count;
  }, [searchQuery, statusFilter, categoryFilter, classificationFilter, datePreset]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setClassificationFilter("");
    setDatePreset("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ txnId, status }: { txnId: string; status: string }) => {
      return api.updateTransaction(user!.business_id!, txnId, { status });
    },
    onSuccess: (updated) => {
      queryClient.setQueriesData(
        { queryKey: ["transactions", user?.business_id ?? ""] },
        (oldData?: Transaction[]) => {
          if (!oldData) return oldData;
          return oldData.map((t) => (t.id === updated.id ? updated : t));
        }
      );
      toastSuccess("Status updated");
    },
    onError: (err) => {
      toastError(err instanceof Error ? err.message : "Failed to update status");
    },
  });

  const bulkPostMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const result: BulkStatusUpdateResponse = await api.bulkUpdateStatus(
        user!.business_id!,
        {
          transaction_ids: ids,
          status: "posted",
        }
      );
      return result;
    },
    onSuccess: (result) => {
      const transactions = result.transactions || [];
      const updatedMap = new Map(transactions.map((t) => [t.id, t]));
      queryClient.setQueriesData(
        { queryKey: ["transactions", user?.business_id ?? ""] },
        (oldData?: Transaction[]) => {
          if (!oldData) return oldData;
          return oldData.map((t) => updatedMap.get(t.id) || t);
        }
      );
      toastSuccess("Drafts posted");
    },
    onError: (err) => {
      toastError(err instanceof Error ? err.message : "Failed to post drafts");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (txnId: string) => api.deleteTransaction(user!.business_id!, txnId),
    onSuccess: (_, txnId) => {
      queryClient.setQueriesData(
        { queryKey: ["transactions", user?.business_id ?? ""] },
        (oldData?: Transaction[]) => {
          if (!oldData) return oldData;
          return oldData.filter((t) => t.id !== txnId);
        }
      );
      toastSuccess("Transaction deleted");
    },
    onError: (err) => {
      toastError(err instanceof Error ? err.message : "Failed to delete transaction");
    },
  });

  const draftTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.status === "draft"),
    [filteredTransactions]
  );

  const handlePostAllDrafts = async () => {
    if (!user?.business_id || draftTransactions.length === 0) return;
    bulkPostMutation.mutate(draftTransactions.map((t) => t.id));
  };

  // Define table columns
  const columns: DataTableColumn<Transaction>[] = useMemo(
    () => [
      {
        key: "vendor",
        header: "Vendor",
        width: "2fr",
        sortable: true,
        render: (txn) => (
          <div>
            <div className="flex items-center gap-1.5">
              {txn.reconciled && (
                <span title="Reconciled">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              )}
              <span className="font-semibold text-heading truncate">
                {txn.vendor_name}
              </span>
            </div>
            {txn.description && (
              <p className="text-xs text-muted truncate">{txn.description}</p>
            )}
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        width: "120px",
        sortable: true,
        align: "right",
        render: (txn) => (
          <div className="text-right">
            <p className={`text-sm font-bold ${txn.classification === "business_income" ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(txn.amount)}
            </p>
            {(parseFloat(txn.gst_amount) > 0 || parseFloat(txn.pst_amount) > 0) && (
              <p className="text-xs text-caption">
                Tax: {formatCurrency(String(parseFloat(txn.gst_amount) + parseFloat(txn.pst_amount)))}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "date",
        header: "Date",
        width: "100px",
        sortable: true,
        render: (txn) => <span className="text-sm text-body">{formatDate(txn.transaction_date)}</span>,
      },
      {
        key: "category",
        header: "Category",
        width: "1.5fr",
        sortable: true,
        render: (txn) => (
          <span className="text-sm text-body">{txn.category || "Uncategorized"}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "130px",
        render: (txn) => {
          const hasTransitions = (VALID_TRANSITIONS[txn.status]?.length ?? 0) > 0;
          
          if (hasTransitions) {
            return (
              <select
                value={txn.status}
                onChange={(e) => {
                  if (user?.business_id) {
                    updateStatusMutation.mutate({ txnId: txn.id, status: e.target.value });
                  }
                }}
                disabled={updateStatusMutation.isPending}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-cyan-500 transition-all ${
                  TRANSACTION_STATUS_COLORS[txn.status] || "bg-surface-tertiary text-body"
                } ${updateStatusMutation.isPending ? "opacity-50" : "hover:shadow-md"}`}
                onClick={(e) => e.stopPropagation()}
              >
                <option value={txn.status}>
                  {TRANSACTION_STATUS_OPTIONS.find((o) => o.value === txn.status)?.label ?? txn.status}
                </option>
                {VALID_TRANSITIONS[txn.status]?.map((val) => (
                  <option key={val} value={val}>
                    {TRANSACTION_STATUS_OPTIONS.find((o) => o.value === val)?.label ?? val}
                  </option>
                ))}
              </select>
            );
          }
          
          return (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${TRANSACTION_STATUS_COLORS[txn.status] || "bg-surface-tertiary text-body"}`}>
              {TRANSACTION_STATUS_OPTIONS.find((o) => o.value === txn.status)?.label ?? txn.status}
            </span>
          );
        },
      },
    ],
    [updateStatusMutation, user?.business_id]
  );

  // Define table actions
  const actions: DataTableAction<Transaction>[] = useMemo(
    () => [
      {
        key: "edit",
        label: "Edit transaction",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        href: (txn) => `/transactions/${txn.id}/edit`,
      },
      {
        key: "receipt",
        label: "Attach receipt",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        ),
        href: (txn) => `/transactions/${txn.id}/edit#receipts`,
        show: (txn) => txn.classification === "business_expense",
      },
      {
        key: "delete",
        label: "Delete transaction",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        variant: "danger",
        onClick: (txn) => {
          if (confirm("Are you sure you want to delete this transaction?")) {
            deleteMutation.mutate(txn.id);
          }
        },
      },
    ],
    [deleteMutation]
  );

  // Bulk actions
  const bulkActions = useMemo(
    () => [
      {
        key: "post",
        label: "Post Selected",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        onClick: (items: Transaction[]) => {
          const draftIds = items.filter((t) => t.status === "draft").map((t) => t.id);
          if (draftIds.length > 0) {
            bulkPostMutation.mutate(draftIds);
          }
        },
        variant: "primary" as const,
      },
      {
        key: "delete",
        label: "Delete Selected",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        onClick: (items: Transaction[]) => {
          if (confirm(`Are you sure you want to delete ${items.length} transactions?`)) {
            items.forEach((t) => deleteMutation.mutate(t.id));
          }
        },
        variant: "danger" as const,
      },
    ],
    [bulkPostMutation, deleteMutation]
  );

  if (authLoading || loading) {
    return <ListSkeleton title="Transactions" actionButton />;
  }

  return (
    <ListPageLayout
      title="Transactions"
      subtitle={`${stats.count} transaction${stats.count === 1 ? "" : "s"}${activeFilterCount > 0 ? ` (filtered)` : ""}`}
    >
      <ErrorAlert error={error} className="mb-6" />

      {/* Action buttons */}
      {canWrite && (
        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          {draftTransactions.length > 0 && (
            <button
              onClick={handlePostAllDrafts}
              disabled={bulkPostMutation.isPending}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {bulkPostMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Posting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Post {draftTransactions.length} Draft{draftTransactions.length === 1 ? "" : "s"}
                </>
              )}
            </button>
          )}
          <Link
            href="/transactions/import"
            className="group inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2.5 text-sm font-bold text-body shadow-sm hover:bg-surface-hover hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import Statements
          </Link>
          {canAdmin && (
            <Link
              href="/transactions/import-quickbooks"
              className="group inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2.5 text-sm font-bold text-body shadow-sm hover:bg-surface-hover hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              QuickBooks Import
            </Link>
          )}
          <Link
            href="/transactions/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </Link>
        </div>
      )}

      {/* Summary stats */}
      {filteredTransactions.length > 0 && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-surface border border-edge-subtle p-3">
            <p className="text-xs font-medium text-muted">Income</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(String(stats.income))}</p>
          </div>
          <div className="rounded-xl bg-surface border border-edge-subtle p-3">
            <p className="text-xs font-medium text-muted">Expenses</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(String(stats.expenses))}</p>
          </div>
          <div className="rounded-xl bg-surface border border-edge-subtle p-3">
            <p className="text-xs font-medium text-muted">Net</p>
            <p className={`text-lg font-bold ${stats.net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(String(stats.net))}
            </p>
          </div>
          <div className="rounded-xl bg-surface border border-edge-subtle p-3">
            <p className="text-xs font-medium text-muted">Transactions</p>
            <p className="text-lg font-bold text-heading">{stats.count}</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="mb-6 space-y-3">
        <FilterBar
          filters={[
            {
              key: "status",
              label: "Status",
              options: TRANSACTION_STATUS_OPTIONS.filter((o) => o.value).map((o) => ({
                value: o.value,
                label: o.label,
              })),
            },
            {
              key: "category",
              label: "Category",
              options: [
                { value: "uncategorized", label: "Uncategorized" },
                ...CRA_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
              ],
            },
            {
              key: "classification",
              label: "Type",
              options: ALL_CLASSIFICATIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              })),
            },
          ]}
          activeFilters={{
            status: statusFilter,
            category: categoryFilter,
            classification: classificationFilter,
          }}
          onFilterChange={(key, value) => {
            if (key === "status") setStatusFilter(value);
            if (key === "category") setCategoryFilter(value);
            if (key === "classification") setClassificationFilter(value);
          }}
          onClearAll={() => {
            setStatusFilter("");
            setCategoryFilter("");
            setClassificationFilter("");
          }}
        />

        {/* Date filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="rounded-xl border-0 py-2 px-3 text-sm text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-inset focus:ring-cyan-600 bg-surface hover:ring-gray-400 transition-all"
          >
            {DATE_PRESETS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {datePreset === "custom" && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="rounded-xl border-0 py-2 px-3 text-sm text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-inset focus:ring-cyan-600 bg-surface"
                aria-label="Start date"
              />
              <span className="text-xs text-muted">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="rounded-xl border-0 py-2 px-3 text-sm text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-inset focus:ring-cyan-600 bg-surface"
                aria-label="End date"
              />
            </>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredTransactions}
        keyExtractor={(txn) => txn.id}
        actions={canWrite ? actions : []}
        bulkActions={canWrite ? bulkActions : []}
        searchFields={["vendor_name", "description", "category"]}
        searchPlaceholder="Search by vendor, description, or category..."
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        loading={loading}
        enableRowSelection={canWrite}
        pageSize={25}
        emptyState={{
          title: "No transactions yet",
          description: canWrite ? "Start by adding your first transaction." : "No transactions have been recorded yet.",
          action: canWrite ? { label: "Add Transaction", href: "/transactions/new" } : undefined,
        }}
        noResultsState={{
          title: "No transactions match your filters",
          description: "Try adjusting your search or filters to find what you're looking for.",
          onClearFilters: clearAllFilters,
        }}
      />
    </ListPageLayout>
  );
}
