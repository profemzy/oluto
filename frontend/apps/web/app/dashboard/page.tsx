"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, DashboardSummary } from "@/app/lib/api";
import { formatCurrency, formatDate, formatRelativeTime } from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    api
      .getDashboardSummary(user.business_id!)
      .then((data) => setSummary(data))
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return <PageLoader />;
  }

  const hasTransactions = summary && summary.transactions_count > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back${user?.full_name ? `, ${user.full_name}` : ""}!`}
      />

      {/* Dashboard Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert error={error} className="mb-6" />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Safe to Spend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Safe to Spend</p>
              {hasTransactions && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Available
                </span>
              )}
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {summary ? formatCurrency(summary.safe_to_spend) : "$0.00"}
            </p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
            </div>
          </div>

          {/* CRA Lockbox */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">CRA Lockbox</p>
              <span className="inline-flex items-center rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700">
                Tax Reserved
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {summary ? formatCurrency(summary.tax_reserved) : "$0.00"}
            </p>
            <p className="mt-1 text-xs text-gray-500">GST/HST + PST</p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Revenue</p>
              {hasTransactions && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Posted
                </span>
              )}
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {summary ? formatCurrency(summary.total_revenue) : "$0.00"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {summary ? `${summary.transactions_count} transaction${summary.transactions_count === 1 ? "" : "s"}` : "No transactions yet"}
            </p>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Expenses</p>
              {hasTransactions && (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Posted
                </span>
              )}
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {summary ? formatCurrency(summary.total_expenses) : "$0.00"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {hasTransactions && parseFloat(summary!.total_revenue) > 0
                ? `${Math.round((parseFloat(summary!.total_expenses) / parseFloat(summary!.total_revenue)) * 100)}% of revenue`
                : ""}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {!hasTransactions && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-cyan-50 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Start by adding your first transaction. Oluto will automatically calculate taxes based on your province.
            </p>
            <Link
              href="/transactions/new"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
            >
              Add Your First Transaction
            </Link>
          </div>
        )}

        {/* Main Content Grid */}
        {hasTransactions && (() => {
          const revenue = parseFloat(summary!.total_revenue);
          const expenses = parseFloat(summary!.total_expenses);
          const tax = parseFloat(summary!.tax_reserved);
          const safeToSpend = parseFloat(summary!.safe_to_spend);
          const maxVal = Math.max(revenue, expenses, tax, Math.abs(safeToSpend), 1);

          const bars = [
            { label: "Revenue", value: revenue, color: "bg-emerald-500", textColor: "text-emerald-700" },
            { label: "Expenses", value: expenses, color: "bg-red-400", textColor: "text-red-700" },
            { label: "Tax Reserved", value: tax, color: "bg-cyan-500", textColor: "text-cyan-700" },
            { label: "Safe to Spend", value: Math.abs(safeToSpend), color: safeToSpend >= 0 ? "bg-gradient-to-r from-cyan-400 to-teal-400" : "bg-amber-400", textColor: safeToSpend >= 0 ? "text-teal-700" : "text-amber-700" },
          ];

          return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column — Charts row + Exceptions below */}
            <div className="lg:col-span-2 space-y-8">
              {/* Top row: Cashflow + Status side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cashflow Breakdown Chart */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Cashflow Breakdown</h2>
                  </div>
                  <div className="p-6 space-y-5">
                    {bars.map((bar) => (
                      <div key={bar.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-gray-600">{bar.label}</span>
                          <span className={`text-sm font-semibold ${bar.textColor}`}>
                            {formatCurrency(bar.value)}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${bar.color}`}
                            style={{ width: `${maxVal > 0 ? Math.max((bar.value / maxVal) * 100, 2) : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Expense ratio</span>
                        <span className="font-semibold text-gray-700">
                          {revenue > 0
                            ? `${Math.round((expenses / revenue) * 100)}%`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Status Overview */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Transaction Status</h2>
                      <span className="text-xs font-medium text-gray-500">{summary!.transactions_count} total</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { key: "posted" as const, label: "Posted", color: "bg-emerald-500", dotColor: "bg-emerald-400" },
                      { key: "ready" as const, label: "Ready", color: "bg-cyan-500", dotColor: "bg-cyan-400" },
                      { key: "draft" as const, label: "Draft", color: "bg-gray-400", dotColor: "bg-gray-300" },
                      { key: "processing" as const, label: "Processing", color: "bg-blue-400", dotColor: "bg-blue-300" },
                      { key: "inbox_user" as const, label: "Needs Review", color: "bg-amber-400", dotColor: "bg-amber-300" },
                      { key: "inbox_firm" as const, label: "Firm Review", color: "bg-purple-400", dotColor: "bg-purple-300" },
                    ].map((s) => {
                      const count = summary!.status_counts[s.key];
                      const total = summary!.transactions_count;
                      const pct = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={s.key} className={count === 0 ? "opacity-40" : ""}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${s.dotColor}`} />
                              <span className="text-sm text-gray-600">{s.label}</span>
                            </div>
                            <span className={`text-sm font-semibold ${count > 0 ? "text-gray-900" : "text-gray-400"}`}>
                              {count}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${s.color}`}
                              style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Exceptions Inbox */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Exceptions Inbox</h2>
                    {summary!.exceptions_count > 0 && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        {summary!.exceptions_count}
                      </span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {summary!.exceptions.length > 0 ? (
                    summary!.exceptions.slice(0, 10).map((txn) => (
                      <Link
                        key={txn.id}
                        href={`/transactions?status=${txn.status}`}
                        className="p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors block"
                      >
                        <span className="text-lg flex-shrink-0">
                          {txn.status === "inbox_user" ? "\u{1F9FE}" : "\u{2753}"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{txn.vendor_name}</p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(txn.amount)} &middot; {formatDate(txn.transaction_date)}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          txn.status === "inbox_user"
                            ? "text-amber-600 bg-amber-50"
                            : "text-purple-600 bg-purple-50"
                        }`}>
                          {txn.status === "inbox_user" ? "Needs review" : "Firm review"}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="mx-auto h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                        <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">All caught up!</p>
                    </div>
                  )}
                </div>
                {summary!.exceptions_count > 0 && (
                  <div className="p-4 border-t border-gray-100">
                    <Link href="/transactions?status=inbox_user" className="text-sm font-medium text-cyan-600 hover:text-cyan-500">
                      View all items &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Info Card */}
              {user && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Role: <span className="font-medium capitalize">{user.role}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                </div>
                <div className="p-4 space-y-4">
                  {summary!.recent_transactions.length > 0 ? (
                    summary!.recent_transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center gap-3">
                        <span className="text-lg">
                          {txn.status === "posted" ? "\u{2705}" : txn.status === "draft" ? "\u{1F4DD}" : "\u{1F4E5}"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{txn.vendor_name}</p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(txn.amount)} &middot; {txn.created_at ? formatRelativeTime(txn.created_at) : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">No recent activity</p>
                  )}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <Link href="/transactions" className="text-sm font-medium text-cyan-600 hover:text-cyan-500">
                    View all transactions &rarr;
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    href="/transactions/new"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all"
                  >
                    <span className="text-xl">{"\u{1F4E4}"}</span>
                    <span className="text-sm font-medium text-gray-700">Add transaction</span>
                  </Link>
                  <Link
                    href="/transactions"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all"
                  >
                    <span className="text-xl">{"\u{1F4CA}"}</span>
                    <span className="text-sm font-medium text-gray-700">View transactions</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
}
