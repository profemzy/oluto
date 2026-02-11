"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Transaction, BulkStatusUpdateResponse } from "@/app/lib/api";
import { formatCurrency, formatDate } from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader } from "@/app/components";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "processing", label: "Processing" },
  { value: "inbox_user", label: "Inbox (User)" },
  { value: "inbox_firm", label: "Inbox (Firm)" },
  { value: "ready", label: "Ready" },
  { value: "posted", label: "Posted" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  processing: "bg-blue-50 text-blue-700",
  inbox_user: "bg-amber-50 text-amber-700",
  inbox_firm: "bg-purple-50 text-purple-700",
  ready: "bg-emerald-50 text-emerald-700",
  posted: "bg-cyan-50 text-cyan-700",
};

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkPosting, setBulkPosting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("status") || "";
    }
    return "";
  });

  useEffect(() => {
    if (!user) return;

    const loadTransactions = async () => {
      try {
        const txns = await api.listTransactions(user.business_id!, {
          status: statusFilter || undefined,
        });
        setTransactions(txns);
      } catch {
        // silently fail — auth errors handled by useAuth
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    loadTransactions();
  }, [user, statusFilter]);

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
  };

  const handleStatusUpdate = async (txnId: number, newStatus: string) => {
    if (!user?.business_id) return;
    setUpdatingStatusId(txnId);
    try {
      const updated = await api.updateTransaction(user.business_id, txnId, {
        status: newStatus,
      });
      setTransactions((prev) =>
        prev.map((t) => (t.id === txnId ? updated : t))
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update status"
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const draftTransactions = transactions.filter((t) => t.status === "draft");

  const handlePostAllDrafts = async () => {
    if (!user?.business_id || draftTransactions.length === 0) return;
    setBulkPosting(true);
    try {
      const result: BulkStatusUpdateResponse = await api.bulkUpdateStatus(
        user.business_id,
        {
          transaction_ids: draftTransactions.map((t) => t.id),
          status: "posted",
        }
      );
      // Update local state with the returned updated transactions
      const updatedMap = new Map(
        result.transactions.map((t) => [t.id, t])
      );
      setTransactions((prev) =>
        prev.map((t) => updatedMap.get(t.id) || t)
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to post drafts"
      );
    } finally {
      setBulkPosting(false);
    }
  };

  const handleDelete = async (txnId: number) => {
    if (!user?.business_id) return;
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await api.deleteTransaction(user.business_id, txnId);
      setTransactions((prev) => prev.filter((t) => t.id !== txnId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete transaction");
    }
  };

  if (authLoading || loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <div className="absolute bottom-40 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-3xl animate-float-slow" />

      <PageHeader
        title="Transactions"
        subtitle={`${transactions.length} transaction${transactions.length === 1 ? "" : "s"}${statusFilter ? ` (${statusFilter})` : ""}`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm bg-white hover:ring-gray-400 transition-all"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="flex flex-wrap items-center gap-3">
            {draftTransactions.length > 0 && (
              <button
                onClick={handlePostAllDrafts}
                disabled={bulkPosting}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {bulkPosting ? (
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
              className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Statements
            </Link>
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
        </div>

        {/* Transaction List */}
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-cyan-50 flex items-center justify-center mb-4 group hover:scale-110 transition-transform">
              <svg className="h-8 w-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {statusFilter ? "No transactions with this status" : "No transactions yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {statusFilter ? "Try a different filter or add a new transaction." : "Start by adding your first transaction."}
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
                <div key={txn.id} className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-teal-50/50 transition-all duration-200 items-center">
                  <div className="col-span-3">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition-colors">{txn.vendor_name}</p>
                    {txn.description && (
                      <p className="text-xs text-gray-500 truncate">{txn.description}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className={`text-sm font-bold ${parseFloat(txn.amount) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {formatCurrency(txn.amount)}
                    </p>
                    {(parseFloat(txn.gst_amount) > 0 || parseFloat(txn.pst_amount) > 0) && (
                      <p className="text-xs text-gray-400">
                        Tax: {formatCurrency(String(parseFloat(txn.gst_amount) + parseFloat(txn.pst_amount)))}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">{formatDate(txn.transaction_date)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">{txn.category || "Uncategorized"}</p>
                  </div>
                  <div className="col-span-2">
                    <select
                      value={txn.status}
                      onChange={(e) =>
                        handleStatusUpdate(txn.id, e.target.value)
                      }
                      disabled={updatingStatusId === txn.id}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-cyan-500 transition-all ${STATUS_COLORS[txn.status] || "bg-gray-100 text-gray-700"} ${updatingStatusId === txn.id ? "opacity-50" : "hover:shadow-md"}`}
                    >
                      {STATUS_OPTIONS.filter((opt) => opt.value !== "").map(
                        (opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => handleDelete(txn.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                      title="Delete transaction"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
