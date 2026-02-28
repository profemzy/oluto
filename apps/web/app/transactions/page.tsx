"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
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
import { ListSkeleton, ErrorAlert, ListPageLayout } from "@/app/components";
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

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  if (!active) {
    return (
      <svg className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/sort:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return direction === "asc" ? (
    <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<ListSkeleton title="Transactions" actionButton />}>
      <TransactionsContent />
    </Suspense>
  );
}

type SortField = "date" | "amount" | "vendor" | "category";

function TransactionsContent() {
  const { user, loading: authLoading } = useAuth();
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
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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

  // Client-side filtering + sorting
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.vendor_name?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q),
      );
    }

    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (categoryFilter) {
      result = result.filter((t) =>
        categoryFilter === "uncategorized" ? !t.category : t.category === categoryFilter,
      );
    }

    if (classificationFilter) {
      result = result.filter((t) => t.classification === classificationFilter);
    }

    result = [...result].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortField) {
        case "date":
          return dir * ((a.transaction_date ?? "").localeCompare(b.transaction_date ?? ""));
        case "amount":
          return dir * (parseFloat(a.amount) - parseFloat(b.amount));
        case "vendor":
          return dir * ((a.vendor_name ?? "").localeCompare(b.vendor_name ?? ""));
        case "category":
          return dir * ((a.category ?? "").localeCompare(b.category ?? ""));
        default:
          return 0;
      }
    });

    return result;
  }, [transactions, searchQuery, statusFilter, categoryFilter, classificationFilter, sortField, sortDirection]);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "vendor" || field === "category" ? "asc" : "desc");
    }
  };

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
        },
      );
      toastSuccess("Status updated");
    },
    onError: (err) => {
      toastError(
        err instanceof Error ? err.message : "Failed to update status",
      );
    },
  });

  const bulkPostMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const result: BulkStatusUpdateResponse = await api.bulkUpdateStatus(
        user!.business_id!,
        {
          transaction_ids: ids,
          status: "posted",
        },
      );
      return result;
    },
    onSuccess: (result) => {
      const updatedMap = new Map(result.transactions.map((t) => [t.id, t]));
      queryClient.setQueriesData(
        { queryKey: ["transactions", user?.business_id ?? ""] },
        (oldData?: Transaction[]) => {
          if (!oldData) return oldData;
          return oldData.map((t) => updatedMap.get(t.id) || t);
        },
      );
      toastSuccess("Drafts posted");
    },
    onError: (err) => {
      toastError(err instanceof Error ? err.message : "Failed to post drafts");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (txnId: string) =>
      api.deleteTransaction(user!.business_id!, txnId),
    onSuccess: (_, txnId) => {
      queryClient.setQueriesData(
        { queryKey: ["transactions", user?.business_id ?? ""] },
        (oldData?: Transaction[]) => {
          if (!oldData) return oldData;
          return oldData.filter((t) => t.id !== txnId);
        },
      );
      toastSuccess("Transaction deleted");
    },
    onError: (err) => {
      toastError(
        err instanceof Error ? err.message : "Failed to delete transaction",
      );
    },
  });

  const draftTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.status === "draft"),
    [filteredTransactions],
  );

  const handleStatusUpdate = async (txnId: string, newStatus: string) => {
    if (!user?.business_id) return;
    updateStatusMutation.mutate({ txnId, status: newStatus });
  };

  const handlePostAllDrafts = async () => {
    if (!user?.business_id || draftTransactions.length === 0) return;
    bulkPostMutation.mutate(draftTransactions.map((t) => t.id));
  };

  const handleDelete = async (txnId: string) => {
    if (!user?.business_id) return;
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    deleteMutation.mutate(txnId);
  };

  if (authLoading || loading) {
    return <ListSkeleton title="Transactions" actionButton />;
  }

  const selectClass =
    "rounded-xl border-0 py-2 px-3 text-sm text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-inset focus:ring-cyan-600 bg-surface hover:ring-gray-400 transition-all";

  return (
    <ListPageLayout
      title="Transactions"
      subtitle={`${stats.count} transaction${stats.count === 1 ? "" : "s"}${activeFilterCount > 0 ? ` (filtered)` : ""}`}
    >
      <ErrorAlert error={error} className="mb-6" />

      {/* Action buttons */}
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
                <svg
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Post {draftTransactions.length} Draft
                {draftTransactions.length === 1 ? "" : "s"}
              </>
            )}
          </button>
        )}
        <Link
          href="/transactions/import"
          className="group inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2.5 text-sm font-bold text-body shadow-sm hover:bg-surface-hover hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg
            className="w-4 h-4 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Import Statements
        </Link>
        <Link
          href="/transactions/import-quickbooks"
          className="group inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2.5 text-sm font-bold text-body shadow-sm hover:bg-surface-hover hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg
            className="w-4 h-4 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          QuickBooks Import
        </Link>
        <Link
          href="/transactions/new"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg
            className="w-4 h-4 group-hover:scale-110 transition-transform"
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
          Add Transaction
        </Link>
      </div>

      {/* Search bar */}
      <div className="mb-3">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by vendor, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-0 py-2.5 pl-10 pr-10 text-sm text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-inset focus:ring-cyan-600 bg-surface placeholder:text-muted transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted hover:text-heading transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectClass}
        >
          {TRANSACTION_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">All Categories</option>
          <option value="uncategorized">Uncategorized</option>
          {CRA_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={classificationFilter}
          onChange={(e) => setClassificationFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">All Types</option>
          {ALL_CLASSIFICATIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={datePreset}
          onChange={(e) => setDatePreset(e.target.value)}
          className={selectClass}
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
              className={selectClass}
              aria-label="Start date"
            />
            <span className="text-xs text-muted">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className={selectClass}
              aria-label="End date"
            />
          </>
        )}

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}
          </button>
        )}
      </div>

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

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center mb-4 group hover:scale-110 transition-transform">
            <svg
              className="h-8 w-8 text-cyan-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-heading mb-2">
            No transactions yet
          </h3>
          <p className="text-sm text-muted mb-6">
            Start by adding your first transaction.
          </p>
          <Link
            href="/transactions/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            Add Transaction
          </Link>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950 flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-heading mb-2">
            No transactions match your filters
          </h3>
          <p className="text-sm text-muted mb-6">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
          <button
            onClick={clearAllFilters}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge text-xs font-bold text-muted uppercase tracking-wider">
            <button
              onClick={() => handleSort("vendor")}
              className="group/sort col-span-3 flex items-center gap-1 text-left hover:text-heading transition-colors"
            >
              Vendor
              <SortIcon active={sortField === "vendor"} direction={sortDirection} />
            </button>
            <button
              onClick={() => handleSort("amount")}
              className="group/sort col-span-2 flex items-center gap-1 text-left hover:text-heading transition-colors"
            >
              Amount
              <SortIcon active={sortField === "amount"} direction={sortDirection} />
            </button>
            <button
              onClick={() => handleSort("date")}
              className="group/sort col-span-2 flex items-center gap-1 text-left hover:text-heading transition-colors"
            >
              Date
              <SortIcon active={sortField === "date"} direction={sortDirection} />
            </button>
            <button
              onClick={() => handleSort("category")}
              className="group/sort col-span-2 flex items-center gap-1 text-left hover:text-heading transition-colors"
            >
              Category
              <SortIcon active={sortField === "category"} direction={sortDirection} />
            </button>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-edge-subtle">
            {filteredTransactions.map((txn) => (
              <div
                key={txn.id}
                className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-teal-50/50 dark:hover:from-cyan-950/30 dark:hover:to-teal-950/30 transition-all duration-200 items-center"
              >
                <div className="col-span-3">
                  <div className="flex items-center gap-1.5">
                    {txn.reconciled && (
                      <span title="Reconciled">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    )}
                    <p className="text-sm font-bold text-heading group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors truncate">
                      {txn.vendor_name}
                    </p>
                  </div>
                  {txn.description && (
                    <p className="text-xs text-muted truncate">
                      {txn.description}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <p
                    className={`text-sm font-bold ${txn.classification === "business_income" ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {formatCurrency(txn.amount)}
                  </p>
                  {(parseFloat(txn.gst_amount) > 0 ||
                    parseFloat(txn.pst_amount) > 0) && (
                    <p className="text-xs text-caption">
                      Tax:{" "}
                      {formatCurrency(
                        String(
                          parseFloat(txn.gst_amount) +
                            parseFloat(txn.pst_amount),
                        ),
                      )}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-body">
                    {formatDate(txn.transaction_date)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-body">
                    {txn.category || "Uncategorized"}
                  </p>
                </div>
                <div className="col-span-2">
                  {(VALID_TRANSITIONS[txn.status]?.length ?? 0) > 0 ? (
                    <select
                      value={txn.status}
                      onChange={(e) =>
                        handleStatusUpdate(txn.id, e.target.value)
                      }
                      disabled={updateStatusMutation.isPending}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-cyan-500 transition-all ${TRANSACTION_STATUS_COLORS[txn.status] || "bg-surface-tertiary text-body"} ${updateStatusMutation.isPending ? "opacity-50" : "hover:shadow-md"}`}
                    >
                      <option value={txn.status}>
                        {TRANSACTION_STATUS_OPTIONS.find(
                          (o) => o.value === txn.status,
                        )?.label ?? txn.status}
                      </option>
                      {VALID_TRANSITIONS[txn.status]?.map((val) => (
                        <option key={val} value={val}>
                          {TRANSACTION_STATUS_OPTIONS.find(
                            (o) => o.value === val,
                          )?.label ?? val}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${TRANSACTION_STATUS_COLORS[txn.status] || "bg-surface-tertiary text-body"}`}
                    >
                      {TRANSACTION_STATUS_OPTIONS.find(
                        (o) => o.value === txn.status,
                      )?.label ?? txn.status}
                    </span>
                  )}
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  <Link
                    href={`/transactions/${txn.id}/edit`}
                    className="p-2 rounded-lg text-caption hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-all duration-200"
                    aria-label="Edit transaction"
                    title="Edit transaction"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>
                  {txn.classification === "business_expense" && (
                    <Link
                      href={`/transactions/${txn.id}/edit#receipts`}
                      className="p-2 rounded-lg text-caption hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-all duration-200"
                      aria-label="Attach receipt"
                      title="Attach receipt"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(txn.id)}
                    className="p-2 rounded-lg text-caption hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                    aria-label="Delete transaction"
                    title="Delete transaction"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ListPageLayout>
  );
}
