"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Transaction, BulkStatusUpdateResponse } from "@/app/lib/api";
import { formatCurrency, formatDate } from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, ErrorAlert, ListPageLayout } from "@/app/components";
import { useDataTable } from "@/app/hooks/useDataTable";
import { toastError, toastSuccess } from "@/app/lib/toast";
import {
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_STATUS_COLORS,
  VALID_TRANSITIONS,
} from "@/app/lib/status";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <TransactionsContent />
    </Suspense>
  );
}

function TransactionsContent() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";

  const listTransactions = (params?: Record<string, string>) => {
    if (!user?.business_id) return Promise.resolve([] as Transaction[]);
    return api.listTransactions(user.business_id, {
      status: params?.status || undefined,
    });
  };

  const {
    data: transactions,
    loading,
    error,
    filter: statusFilter,
    setFilter: setStatusFilter,
  } = useDataTable<Transaction>({
    queryKey: ["transactions", user?.business_id ?? ""],
    queryFn: listTransactions,
    defaultFilter: initialStatus,
    enabled: !!user?.business_id,
  });

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
    () => transactions.filter((t) => t.status === "draft"),
    [transactions],
  );

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
  };

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
    return <PageLoader />;
  }

  return (
    <ListPageLayout
      title="Transactions"
      subtitle={`${transactions.length} transaction${transactions.length === 1 ? "" : "s"}${statusFilter ? ` (${statusFilter})` : ""}`}
    >
      <ErrorAlert error={error} className="mb-6" />
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm bg-white hover:ring-gray-400 transition-all"
        >
          {TRANSACTION_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-3">
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
            className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200"
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
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-cyan-50 flex items-center justify-center mb-4 group hover:scale-110 transition-transform">
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
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {statusFilter
              ? "No transactions with this status"
              : "No transactions yet"}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {statusFilter
              ? "Try a different filter or add a new transaction."
              : "Start by adding your first transaction."}
          </p>
          <Link
            href="/transactions/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            Add Transaction
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Vendor</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-teal-50/50 transition-all duration-200 items-center"
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
                    <p className="text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition-colors truncate">
                      {txn.vendor_name}
                    </p>
                  </div>
                  {txn.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {txn.description}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <p
                    className={`text-sm font-bold ${parseFloat(txn.amount) < 0 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {formatCurrency(txn.amount)}
                  </p>
                  {(parseFloat(txn.gst_amount) > 0 ||
                    parseFloat(txn.pst_amount) > 0) && (
                    <p className="text-xs text-gray-400">
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
                  <p className="text-sm text-gray-600">
                    {formatDate(txn.transaction_date)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">
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
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-cyan-500 transition-all ${TRANSACTION_STATUS_COLORS[txn.status] || "bg-gray-100 text-gray-700"} ${updateStatusMutation.isPending ? "opacity-50" : "hover:shadow-md"}`}
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
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${TRANSACTION_STATUS_COLORS[txn.status] || "bg-gray-100 text-gray-700"}`}
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
                    className="p-2 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200"
                    title="Edit transaction"
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
                  {parseFloat(txn.amount) < 0 && (
                    <Link
                      href={`/transactions/${txn.id}/edit#receipts`}
                      className="p-2 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200"
                      title="Attach receipt"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(txn.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                    title="Delete transaction"
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
