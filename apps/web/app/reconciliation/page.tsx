"use client";

import { useMemo, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  ReconciliationSummary,
  ReconciliationSuggestion,
  Transaction,
  DuplicateGroup,
} from "@/app/lib/api";
import { formatCurrency, formatDate } from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, ListPageLayout } from "@/app/components";
import { toastError, toastSuccess } from "@/app/lib/toast";
import Link from "next/link";

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
  medium: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
  low: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
};

function confidenceLevel(confidence: string): "high" | "medium" | "low" {
  const val = parseFloat(confidence);
  if (val >= 0.8) return "high";
  if (val >= 0.5) return "medium";
  return "low";
}

const RECONCILIATION_QUERY_KEYS = [
  "reconciliation-summary",
  "reconciliation-suggestions",
  "reconciliation-unreconciled",
  "reconciliation-reconciled",
  "reconciliation-duplicates",
];

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  RECONCILIATION_QUERY_KEYS.forEach((key) =>
    queryClient.invalidateQueries({ queryKey: [key] }),
  );
}

export default function ReconciliationPage() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const businessId = user?.business_id;

  // --- Selection state for bulk actions ---
  const [selectedUnreconciled, setSelectedUnreconciled] = useState<Set<string>>(
    new Set(),
  );
  const [showReconciled, setShowReconciled] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);

  // --- Queries ---
  const { data: summary, isLoading: summaryLoading } =
    useQuery<ReconciliationSummary | null>({
      queryKey: ["reconciliation-summary", businessId],
      queryFn: () => api.getReconciliationSummary(businessId!),
      enabled: !!businessId,
    });

  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery<
    ReconciliationSuggestion[]
  >({
    queryKey: ["reconciliation-suggestions", businessId],
    queryFn: () => api.getReconciliationSuggestions(businessId!),
    enabled: !!businessId,
  });

  const { data: unreconciled = [], isLoading: unreconciledLoading } = useQuery<
    Transaction[]
  >({
    queryKey: ["reconciliation-unreconciled", businessId],
    queryFn: () => api.getUnreconciledTransactions(businessId!, 100),
    enabled: !!businessId,
  });

  const { data: reconciled = [] } = useQuery<Transaction[]>({
    queryKey: ["reconciliation-reconciled", businessId],
    queryFn: () => api.getReconciledTransactions(businessId!, 100),
    enabled: !!businessId && showReconciled,
  });

  const { data: duplicates = [] } = useQuery<DuplicateGroup[]>({
    queryKey: ["reconciliation-duplicates", businessId],
    queryFn: () => api.findDuplicates(businessId!),
    enabled: !!businessId,
  });

  // --- Mutations ---
  const confirmMutation = useMutation({
    mutationFn: (suggestion: ReconciliationSuggestion) =>
      api.confirmMatch(businessId!, {
        transaction_id: suggestion.transaction.id,
        match_id: suggestion.suggested_match.match_id,
        match_type: suggestion.suggested_match.match_type,
      }),
    onSuccess: () => {
      invalidateAll(queryClient);
      toastSuccess("Match confirmed");
    },
    onError: (err) => {
      toastError(
        err instanceof Error ? err.message : "Failed to confirm match",
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (suggestion: ReconciliationSuggestion) =>
      api.rejectMatch(businessId!, {
        suggestion_id: suggestion.suggestion_id,
      }),
    onSuccess: () => {
      invalidateAll(queryClient);
      toastSuccess("Match rejected");
    },
    onError: (err) => {
      toastError(err instanceof Error ? err.message : "Failed to reject match");
    },
  });

  const autoReconcileMutation = useMutation({
    mutationFn: () => api.autoReconcile(businessId!, 0.9),
    onSuccess: (result) => {
      invalidateAll(queryClient);
      if (result.suggestions_found > 0) {
        toastSuccess(
          `Found ${result.suggestions_found} match suggestion${result.suggestions_found === 1 ? "" : "s"}`,
        );
      } else {
        toastError("No high-confidence matches found");
      }
    },
    onError: (err) => {
      toastError(
        err instanceof Error ? err.message : "Find matches failed",
      );
    },
  });

  const markReconciledMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Show confirmation dialog with warning
      const confirmed = window.confirm(
        `\u26A0\uFE0F Manual Reconciliation Warning\n\n` +
        `You are about to mark ${ids.length} transaction${ids.length === 1 ? "" : "s"} as reconciled without matching them to payments.\n\n` +
        `This should only be done if:\n` +
        `\u2022 You've verified the transaction in your bank statement\n` +
        `\u2022 The transaction doesn't require payment matching (e.g., transfers, adjustments)\n\n` +
        `For expenses and income, it's better to use "Find Matches" to link them to actual payments.\n\n` +
        `Continue with manual reconciliation?`
      );

      if (!confirmed) {
        throw new Error("Reconciliation cancelled by user");
      }

      return api.markReconciled(businessId!, { transaction_ids: ids });
    },
    onSuccess: (result) => {
      invalidateAll(queryClient);
      setSelectedUnreconciled(new Set());
      toastSuccess(
        `Marked ${result.updated_count} transaction${result.updated_count === 1 ? "" : "s"} as reconciled`,
      );
    },
    onError: (err) => {
      // Don't show error toast if user cancelled
      if (err instanceof Error && err.message === "Reconciliation cancelled by user") {
        return;
      }
      toastError(
        err instanceof Error ? err.message : "Failed to mark reconciled",
      );
    },
  });

  const markUnreconciledMutation = useMutation({
    mutationFn: (ids: string[]) =>
      api.markUnreconciled(businessId!, { transaction_ids: ids }),
    onSuccess: (result) => {
      invalidateAll(queryClient);
      toastSuccess(
        `Marked ${result.updated_count} transaction${result.updated_count === 1 ? "" : "s"} as unreconciled`,
      );
    },
    onError: (err) => {
      toastError(
        err instanceof Error ? err.message : "Failed to mark unreconciled",
      );
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (txnId: string) =>
      api.deleteTransaction(businessId!, txnId),
    onSuccess: () => {
      invalidateAll(queryClient);
      toastSuccess("Duplicate deleted");
    },
    onError: (err) => {
      toastError(
        err instanceof Error ? err.message : "Failed to delete transaction",
      );
    },
  });

  // --- Derived data ---
  const unreconciledOnly = useMemo(() => {
    const suggestedTxnIds = new Set(suggestions.map((s) => s.transaction.id));
    return unreconciled.filter((t) => !suggestedTxnIds.has(t.id));
  }, [suggestions, unreconciled]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedUnreconciled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedUnreconciled((prev) => {
      if (prev.size === unreconciledOnly.length)
        return new Set();
      return new Set(unreconciledOnly.map((t) => t.id));
    });
  }, [unreconciledOnly]);

  // --- Loading ---
  const loadingState =
    authLoading || summaryLoading || suggestionsLoading || unreconciledLoading;
  if (loadingState) {
    return <PageLoader />;
  }

  return (
    <ListPageLayout
      title="Bank Reconciliation"
      subtitle="Match imported transactions to recorded payments and verify expenses"
    >
      {/* Duplicate Alert Banner */}
      {duplicates.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                  {duplicates.length} potential duplicate group{duplicates.length === 1 ? "" : "s"} found
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Same date, amount, and vendor — keep one and delete the rest to avoid double-counting
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDuplicates(!showDuplicates)}
              className="rounded-lg bg-amber-100 dark:bg-amber-900 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
            >
              {showDuplicates ? "Hide" : "Review & Delete"}
            </button>
          </div>

          {showDuplicates && (
            <div className="mt-4 space-y-3">
              {duplicates.map((group, gi) => (
                <div key={gi} className="rounded-xl bg-surface border border-amber-100 dark:border-amber-900 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-heading">{group.vendor_name}</span>
                    <span className="text-xs text-muted">{formatDate(group.transaction_date)}</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{formatCurrency(group.amount)}</span>
                    <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      {group.count} entries
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted">{txn.id.slice(0, 8)}</span>
                          <span className="text-xs text-body">{txn.import_source ? `Imported (${txn.import_source})` : "Manual"}</span>
                          <span className="text-xs text-caption">{txn.created_at ? formatDate(txn.created_at) : ""}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Delete duplicate "${txn.vendor_name}" (${txn.id.slice(0, 8)})? This cannot be undone.`))
                              deleteTransactionMutation.mutate(txn.id);
                          }}
                          disabled={deleteTransactionMutation.isPending}
                          className="rounded-lg bg-red-50 dark:bg-red-950 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="Total" value={summary.total_transactions} color="gray" />
          <SummaryCard label="Reconciled" value={summary.reconciled} color="emerald" />
          <SummaryCard label="Unreconciled" value={summary.unreconciled} color="amber" />
          <SummaryCard label="Suggestions" value={summary.suggested_matches} color="cyan" />
        </div>
      )}

      {/* Find Matches Button + Suggested Matches Header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-heading">
          Suggested Matches
          {suggestions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted">
              ({suggestions.length})
            </span>
          )}
        </h2>
        <button
          onClick={() => autoReconcileMutation.mutate()}
          disabled={autoReconcileMutation.isPending}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {autoReconcileMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Searching...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Matches
            </>
          )}
        </button>
      </div>

      {/* Suggestions List */}
      {suggestions.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-12 text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-heading mb-2">No Suggestions</h3>
          <p className="text-sm text-muted">
            Click &quot;Find Matches&quot; to scan for payment matches, or manually reconcile transactions below.
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {suggestions.map((suggestion) => {
            const level = confidenceLevel(suggestion.confidence);
            const isProcessing = confirmMutation.isPending || rejectMutation.isPending;

            return (
              <div key={suggestion.suggestion_id} className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left: Bank Transaction */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-caption uppercase tracking-wider mb-1">Bank Transaction</div>
                    <p className="text-sm font-bold text-heading truncate">{suggestion.transaction.vendor_name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-sm font-bold ${parseFloat(suggestion.transaction.amount) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {formatCurrency(suggestion.transaction.amount)}
                      </span>
                      <span className="text-xs text-caption">{formatDate(suggestion.transaction.transaction_date)}</span>
                    </div>
                  </div>

                  {/* Center: Match Arrow + Confidence */}
                  <div className="flex items-center gap-3 lg:flex-col lg:items-center">
                    <svg className="w-6 h-6 text-caption hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${CONFIDENCE_COLORS[level]}`}>
                      {(parseFloat(suggestion.confidence) * 100).toFixed(0)}%
                    </span>
                    <p className="text-xs text-caption text-center max-w-[200px] hidden lg:block">{suggestion.match_reason}</p>
                  </div>

                  {/* Right: Matched Payment */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-caption uppercase tracking-wider mb-1">
                      {suggestion.suggested_match.match_type === "payment" ? "Customer Payment" : "Bill Payment"}
                    </div>
                    <p className="text-sm font-bold text-heading truncate">{suggestion.suggested_match.counterparty}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-emerald-600">{formatCurrency(suggestion.suggested_match.amount)}</span>
                      <span className="text-xs text-caption">{formatDate(suggestion.suggested_match.date)}</span>
                      {suggestion.suggested_match.reference && (
                        <span className="text-xs text-caption">#{suggestion.suggested_match.reference}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:flex-shrink-0">
                    <button
                      onClick={() => confirmMutation.mutate(suggestion)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(suggestion)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
                <p className="text-xs text-caption mt-2 lg:hidden">{suggestion.match_reason}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Unreconciled Transactions with selection */}
      {unreconciledOnly.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-heading">
                Unreconciled Transactions
                <span className="ml-2 text-sm font-normal text-muted">({unreconciledOnly.length})</span>
              </h2>
              <p className="text-xs text-muted mt-1">
                Tip: Use &quot;Find Matches&quot; to auto-match transactions with payments, or manually reconcile if no payment matching is needed
              </p>
            </div>
            {selectedUnreconciled.size > 0 && (
              <button
                onClick={() => markReconciledMutation.mutate(Array.from(selectedUnreconciled))}
                disabled={markReconciledMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors disabled:opacity-50"
                title="Manually mark as reconciled (shows confirmation dialog)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark Reconciled ({selectedUnreconciled.size})
              </button>
            )}
          </div>
          <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden mb-8">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge text-xs font-bold text-muted uppercase tracking-wider">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedUnreconciled.size === unreconciledOnly.length && unreconciledOnly.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-edge text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <div className="col-span-3">Vendor</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Actions</div>
            </div>
            <div className="divide-y divide-edge-subtle">
              {unreconciledOnly.map((txn) => (
                <div
                  key={txn.id}
                  className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-surface-hover/50 transition-colors items-center ${selectedUnreconciled.has(txn.id) ? "bg-emerald-50/30 dark:bg-emerald-950/30" : ""}`}
                >
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedUnreconciled.has(txn.id)}
                      onChange={() => toggleSelect(txn.id)}
                      className="h-4 w-4 rounded border-edge text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-bold text-heading">{txn.vendor_name}</p>
                    {txn.description && (
                      <p className="text-xs text-muted truncate">{txn.description}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className={`text-sm font-bold ${parseFloat(txn.amount) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {formatCurrency(txn.amount)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-body">{formatDate(txn.transaction_date)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-body">{txn.category || "Uncategorized"}</p>
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    <button
                      onClick={() => markReconciledMutation.mutate([txn.id])}
                      disabled={markReconciledMutation.isPending}
                      className="rounded-lg p-1.5 text-caption hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                      title="Mark reconciled"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <Link
                      href={`/transactions/${txn.id}/edit#receipts`}
                      className="rounded-lg p-1.5 text-caption hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-colors"
                      title="Attach receipt"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Reconciled Transactions (collapsible) */}
      {summary && summary.reconciled > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowReconciled(!showReconciled)}
            className="flex items-center gap-2 text-lg font-bold text-heading mb-4 hover:text-body transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${showReconciled ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Reconciled Transactions
            <span className="text-sm font-normal text-muted">({summary.reconciled})</span>
          </button>

          {showReconciled && (
            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge text-xs font-bold text-muted uppercase tracking-wider">
                <div className="col-span-4">Vendor</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Actions</div>
              </div>
              <div className="divide-y divide-edge-subtle">
                {reconciled.map((txn) => (
                  <div
                    key={txn.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-surface-hover/50 transition-colors items-center"
                  >
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-heading truncate">{txn.vendor_name}</p>
                          {txn.description && (
                            <p className="text-xs text-muted truncate">{txn.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className={`text-sm font-bold ${parseFloat(txn.amount) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {formatCurrency(txn.amount)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-body">{formatDate(txn.transaction_date)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-body">{txn.category || "Uncategorized"}</p>
                    </div>
                    <div className="col-span-2">
                      <button
                        onClick={() => markUnreconciledMutation.mutate([txn.id])}
                        disabled={markUnreconciledMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-surface-secondary px-2.5 py-1.5 text-xs font-bold text-body hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Unreconcile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state when everything is reconciled */}
      {suggestions.length === 0 &&
        unreconciledOnly.length === 0 &&
        summary &&
        summary.total_transactions > 0 &&
        summary.unreconciled === 0 && (
          <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-heading mb-2">All Reconciled</h3>
            <p className="text-sm text-muted">
              All transactions have been reconciled. Great job!
            </p>
          </div>
        )}
    </ListPageLayout>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "gray" | "emerald" | "amber" | "cyan";
}) {
  const colorMap = {
    gray: "from-surface-secondary to-surface-tertiary text-heading",
    emerald: "from-emerald-50 dark:from-emerald-950 to-emerald-100 dark:to-emerald-900 text-emerald-700 dark:text-emerald-300",
    amber: "from-amber-50 dark:from-amber-950 to-amber-100 dark:to-amber-900 text-amber-700 dark:text-amber-300",
    cyan: "from-cyan-50 dark:from-cyan-950 to-cyan-100 dark:to-cyan-900 text-cyan-700 dark:text-cyan-300",
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${colorMap[color]} p-5 shadow-sm border border-edge-subtle`}
    >
      <p className="text-xs font-bold uppercase tracking-wider opacity-60">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}
