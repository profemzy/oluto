"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  ReconciliationSummary,
  ReconciliationSuggestion,
  Transaction,
} from "@/app/lib/api";
import { formatCurrency, formatDate } from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, ListPageLayout } from "@/app/components";
import { toastError, toastSuccess } from "@/app/lib/toast";

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-red-100 text-red-700",
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
];

export default function ReconciliationPage() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const businessId = user?.business_id;

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
    queryFn: () => api.getUnreconciledTransactions(businessId!, 50),
    enabled: !!businessId,
  });

  const confirmMutation = useMutation({
    mutationFn: (suggestion: ReconciliationSuggestion) =>
      api.confirmMatch(businessId!, {
        transaction_id: suggestion.transaction.id,
        match_id: suggestion.suggested_match.match_id,
        match_type: suggestion.suggested_match.match_type,
      }),
    onSuccess: () => {
      RECONCILIATION_QUERY_KEYS.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
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
      RECONCILIATION_QUERY_KEYS.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      toastSuccess("Match rejected");
    },
    onError: (err) => {
      toastError(err instanceof Error ? err.message : "Failed to reject match");
    },
  });

  const autoReconcileMutation = useMutation({
    mutationFn: () => api.autoReconcile(businessId!, 0.9),
    onSuccess: (result) => {
      RECONCILIATION_QUERY_KEYS.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      if (result.matched_count > 0) {
        toastSuccess(
          `Auto-reconciled ${result.matched_count} transaction${result.matched_count === 1 ? "" : "s"}`,
        );
      } else {
        toastError("No high-confidence matches found to auto-reconcile");
      }
    },
    onError: (err) => {
      toastError(err instanceof Error ? err.message : "Auto-reconcile failed");
    },
  });

  const unreconciledOnly = useMemo(() => {
    const suggestedTxnIds = new Set(suggestions.map((s) => s.transaction.id));
    return unreconciled.filter((t) => !suggestedTxnIds.has(t.id));
  }, [suggestions, unreconciled]);

  const loadingState =
    authLoading || summaryLoading || suggestionsLoading || unreconciledLoading;
  if (loadingState) {
    return <PageLoader />;
  }

  return (
    <ListPageLayout
      title="Bank Reconciliation"
      subtitle="Match imported transactions to recorded payments"
    >
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            label="Total"
            value={summary.total_transactions}
            color="gray"
          />
          <SummaryCard
            label="Reconciled"
            value={summary.reconciled}
            color="emerald"
          />
          <SummaryCard
            label="Unreconciled"
            value={summary.unreconciled}
            color="amber"
          />
          <SummaryCard
            label="Suggestions"
            value={summary.suggested_matches}
            color="cyan"
          />
        </div>
      )}

      {/* Auto-Reconcile Button */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          Suggested Matches
          {suggestions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({suggestions.length})
            </span>
          )}
        </h2>
        <button
          onClick={() => autoReconcileMutation.mutate()}
          disabled={autoReconcileMutation.isPending || suggestions.length === 0}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {autoReconcileMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Processing...
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Auto-Reconcile
            </>
          )}
        </button>
      </div>

      {/* Suggestions List */}
      {suggestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No Suggestions
          </h3>
          <p className="text-sm text-gray-500">
            Import bank transactions and record payments to see matching
            suggestions here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {suggestions.map((suggestion) => {
            const level = confidenceLevel(suggestion.confidence);
            const isProcessing =
              confirmMutation.isPending || rejectMutation.isPending;

            return (
              <div
                key={suggestion.suggestion_id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left: Bank Transaction */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Bank Transaction
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {suggestion.transaction.vendor_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`text-sm font-bold ${parseFloat(suggestion.transaction.amount) < 0 ? "text-red-600" : "text-emerald-600"}`}
                      >
                        {formatCurrency(suggestion.transaction.amount)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(suggestion.transaction.transaction_date)}
                      </span>
                    </div>
                  </div>

                  {/* Center: Match Arrow + Confidence */}
                  <div className="flex items-center gap-3 lg:flex-col lg:items-center">
                    <svg
                      className="w-6 h-6 text-gray-300 hidden lg:block"
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
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${CONFIDENCE_COLORS[level]}`}
                    >
                      {(parseFloat(suggestion.confidence) * 100).toFixed(0)}%
                    </span>
                    <p className="text-xs text-gray-400 text-center max-w-[200px] hidden lg:block">
                      {suggestion.match_reason}
                    </p>
                  </div>

                  {/* Right: Matched Payment */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {suggestion.suggested_match.match_type === "payment"
                        ? "Customer Payment"
                        : "Bill Payment"}
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {suggestion.suggested_match.counterparty}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-emerald-600">
                        {formatCurrency(suggestion.suggested_match.amount)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(suggestion.suggested_match.date)}
                      </span>
                      {suggestion.suggested_match.reference && (
                        <span className="text-xs text-gray-400">
                          #{suggestion.suggested_match.reference}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:flex-shrink-0">
                    <button
                      onClick={() => confirmMutation.mutate(suggestion)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <svg
                        className="w-3.5 h-3.5"
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
                      Confirm
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(suggestion)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>

                {/* Match reason on mobile */}
                <p className="text-xs text-gray-400 mt-2 lg:hidden">
                  {suggestion.match_reason}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Unreconciled Transactions (no suggestion) */}
      {unreconciledOnly.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Unreconciled Transactions
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({unreconciledOnly.length})
            </span>
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Vendor</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Status</div>
            </div>
            <div className="divide-y divide-gray-100">
              {unreconciledOnly.map((txn) => (
                <div
                  key={txn.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors items-center"
                >
                  <div className="col-span-4">
                    <p className="text-sm font-bold text-gray-900">
                      {txn.vendor_name}
                    </p>
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
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                      Unreconciled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty state when everything is reconciled */}
      {suggestions.length === 0 &&
        unreconciledOnly.length === 0 &&
        summary &&
        summary.total_transactions > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              All Reconciled
            </h3>
            <p className="text-sm text-gray-500">
              All transactions have been matched to payments. Great job!
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
    gray: "from-gray-50 to-gray-100 text-gray-900",
    emerald: "from-emerald-50 to-emerald-100 text-emerald-700",
    amber: "from-amber-50 to-amber-100 text-amber-700",
    cyan: "from-cyan-50 to-cyan-100 text-cyan-700",
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${colorMap[color]} p-5 shadow-sm border border-gray-100`}
    >
      <p className="text-xs font-bold uppercase tracking-wider opacity-60">
        {label}
      </p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}
