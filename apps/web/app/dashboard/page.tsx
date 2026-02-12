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
    <div className="min-h-[calc(100vh-4rem)] relative">
      {/* Decorative Background Dots with animations */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-cyan-200 rounded-full opacity-30 blur-2xl animate-bounce-subtle" />
      <div className="absolute top-40 left-20 w-32 h-32 bg-green-200 rounded-full opacity-30 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-teal-200 rounded-full opacity-25 blur-2xl animate-float-slow" />
      <div className="absolute top-1/3 left-[5%] w-16 h-16 bg-cyan-100 rounded-full opacity-40 blur-xl animate-bounce-gentle" />

      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back${user?.full_name ? `, ${user.full_name}` : ""}!`}
      />

      {/* Dashboard Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />

        {/* Stats Grid with enhanced hover effects */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Safe to Spend */}
          <div className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-10 blur-xl group-hover:opacity-20 group-hover:scale-125 transition-all duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <p className="text-sm font-semibold text-gray-600">Safe to Spend</p>
              {hasTransactions && (
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm animate-pulse-slow">
                  Available
                </span>
              )}
            </div>
            <p className="mt-3 text-4xl font-black bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent relative z-10 group-hover:scale-105 transition-transform origin-left">
              {summary ? formatCurrency(summary.safe_to_spend) : "$0.00"}
            </p>
            <div className="mt-5 h-2.5 bg-gray-100 rounded-full overflow-hidden relative z-10">
              <div className="h-full w-3/4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-sm" />
            </div>
          </div>

          {/* CRA Lockbox */}
          <div className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full opacity-10 blur-xl group-hover:opacity-20 group-hover:scale-125 transition-all duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <p className="text-sm font-semibold text-gray-600">CRA Lockbox</p>
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                Net Owed
              </span>
            </div>
            <p className="mt-3 text-4xl font-black bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent relative z-10 group-hover:scale-105 transition-transform origin-left">
              {summary ? formatCurrency(summary.tax_reserved) : "$0.00"}
            </p>
            {summary && hasTransactions && (
              <div className="mt-2 space-y-0.5 relative z-10">
                <p className="text-xs text-gray-500">
                  Collected: <span className="font-semibold text-gray-700">{formatCurrency(summary.tax_collected)}</span>
                  {" "}&minus;{" "}ITCs: <span className="font-semibold text-green-600">{formatCurrency(summary.tax_itc)}</span>
                </p>
              </div>
            )}
            {!(summary && hasTransactions) && (
              <p className="mt-2 text-xs font-medium text-gray-500 relative z-10">GST/HST collected &minus; ITCs</p>
            )}
          </div>

          {/* Revenue */}
          <div className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full opacity-10 blur-xl group-hover:opacity-20 group-hover:scale-125 transition-all duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <p className="text-sm font-semibold text-gray-600">Revenue</p>
              {hasTransactions && (
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                  Posted
                </span>
              )}
            </div>
            <p className="mt-3 text-4xl font-black text-gray-900 relative z-10 group-hover:scale-105 transition-transform origin-left">
              {summary ? formatCurrency(summary.total_revenue) : "$0.00"}
            </p>
            <p className="mt-2 text-xs font-medium text-gray-500 relative z-10">
              {summary && parseFloat(summary.payments_received) > 0
                ? `Incl. ${formatCurrency(summary.payments_received)} in payments`
                : summary ? `${summary.transactions_count} transaction${summary.transactions_count === 1 ? "" : "s"}` : "No transactions yet"}
            </p>
          </div>

          {/* Expenses */}
          <div className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-lg shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full opacity-10 blur-xl group-hover:opacity-20 group-hover:scale-125 transition-all duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <p className="text-sm font-semibold text-gray-600">Expenses</p>
              {hasTransactions && (
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                  Posted
                </span>
              )}
            </div>
            <p className="mt-3 text-4xl font-black text-gray-900 relative z-10 group-hover:scale-105 transition-transform origin-left">
              {summary ? formatCurrency(summary.total_expenses) : "$0.00"}
            </p>
            <p className="mt-2 text-xs font-medium text-gray-500 relative z-10">
              {hasTransactions && parseFloat(summary!.total_revenue) > 0
                ? `${Math.round((parseFloat(summary!.total_expenses) / parseFloat(summary!.total_revenue)) * 100)}% of revenue`
                : ""}
            </p>
          </div>
        </div>

        {/* Outstanding Receivables & Payables */}
        {hasTransactions && summary && (parseFloat(summary.outstanding_receivables) > 0 || parseFloat(summary.outstanding_payables) > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {parseFloat(summary.outstanding_receivables) > 0 && (
              <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-md flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Outstanding Receivables</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.outstanding_receivables)}</p>
                  <p className="text-xs text-gray-500">Unpaid invoices owed to you</p>
                </div>
              </div>
            )}
            {parseFloat(summary.outstanding_payables) > 0 && (
              <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-md flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Outstanding Payables</p>
                  <p className="text-xl font-bold text-amber-600">{formatCurrency(summary.outstanding_payables)}</p>
                  <p className="text-xs text-gray-500">Unpaid bills you owe (deducted from Safe to Spend)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State with enhanced animations */}
        {!hasTransactions && (
          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center mb-8 overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-cyan-200 to-green-200 rounded-full opacity-20 blur-3xl animate-float-slow" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-teal-200 to-emerald-200 rounded-full opacity-20 blur-3xl animate-float" />
            <div className="relative z-10">
              <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center mb-6 shadow-lg hover:shadow-cyan-500/50 hover:scale-110 transition-all duration-300 cursor-pointer">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">No transactions yet</h3>
              <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                Start by adding your first transaction. Oluto will <span className="font-semibold">automatically calculate taxes</span> based on your province.
              </p>
              <Link
                href="/transactions/new"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all duration-300 btn-glow"
              >
                Add Your First Transaction
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        {hasTransactions && (() => {
          const revenue = parseFloat(summary!.total_revenue);
          const expenses = parseFloat(summary!.total_expenses);
          const tax = parseFloat(summary!.tax_reserved);
          const safeToSpend = parseFloat(summary!.safe_to_spend);
          const maxVal = Math.max(revenue, expenses, tax, Math.abs(safeToSpend), 1);

          const payables = parseFloat(summary!.outstanding_payables);

          const bars = [
            { label: "Revenue", value: revenue, color: "bg-emerald-500", textColor: "text-emerald-700" },
            { label: "Expenses", value: expenses, color: "bg-red-400", textColor: "text-red-700" },
            { label: "CRA Lock (Net)", value: tax, color: "bg-cyan-500", textColor: "text-cyan-700" },
            ...(payables > 0 ? [{ label: "Unpaid Bills", value: payables, color: "bg-amber-400", textColor: "text-amber-700" }] : []),
            { label: "Safe to Spend", value: Math.abs(safeToSpend), color: safeToSpend >= 0 ? "bg-gradient-to-r from-cyan-400 to-teal-400" : "bg-amber-400", textColor: safeToSpend >= 0 ? "text-teal-700" : "text-amber-700" },
          ];

          return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column — Charts row + Exceptions below */}
            <div className="lg:col-span-2 space-y-8">
              {/* Top row: Cashflow + Status side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cashflow Breakdown Chart */}
                <div className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Cashflow Breakdown</h2>
                  </div>
                  <div className="p-6 space-y-5">
                    {bars.map((bar) => (
                      <div key={bar.label} className="group/bar">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-gray-600">{bar.label}</span>
                          <span className={`text-sm font-bold ${bar.textColor}`}>
                            {formatCurrency(bar.value)}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${bar.color} group-hover/bar:opacity-80`}
                            style={{ width: `${maxVal > 0 ? Math.max((bar.value / maxVal) * 100, 2) : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Expense ratio</span>
                        <span className="font-bold text-gray-700">
                          {revenue > 0
                            ? `${Math.round((expenses / revenue) * 100)}%`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Status Overview */}
                <div className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900">Transaction Status</h2>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">{summary!.transactions_count} total</span>
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
              <div className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Exceptions Inbox</h2>
                    {summary!.exceptions_count > 0 && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm animate-pulse-slow">
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
                        className="p-4 flex items-start gap-3 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 transition-all block group/item"
                      >
                        <span className="text-lg flex-shrink-0 group-hover/item:scale-110 transition-transform">
                          {txn.status === "inbox_user" ? "\u{1F9FE}" : "\u{2753}"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{txn.vendor_name}</p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(txn.amount)} &middot; {formatDate(txn.transaction_date)}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          txn.status === "inbox_user"
                            ? "text-amber-600 bg-amber-50 ring-1 ring-amber-200"
                            : "text-purple-600 bg-purple-50 ring-1 ring-purple-200"
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
                    <Link href="/transactions?status=inbox_user" className="text-sm font-bold text-cyan-600 hover:text-cyan-500 flex items-center gap-1 group/link">
                      View all items
                      <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Info Card */}
              {user && (
                <div className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Account</h2>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 group-hover:shadow-cyan-500/30 transition-all duration-300">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Role: <span className="font-bold capitalize text-cyan-600">{user.role}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                </div>
                <div className="p-4 space-y-4">
                  {summary!.recent_transactions.length > 0 ? (
                    summary!.recent_transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center gap-3 group/txn">
                        <span className="text-lg group-hover/txn:scale-110 transition-transform">
                          {txn.status === "posted" ? "\u{2705}" : txn.status === "draft" ? "\u{1F4DD}" : "\u{1F4E5}"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{txn.vendor_name}</p>
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
                  <Link href="/transactions" className="text-sm font-bold text-cyan-600 hover:text-cyan-500 flex items-center gap-1 group/link">
                    View all transactions
                    <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    href="/transactions/new"
                    className="group flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-cyan-400 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 transition-all duration-300"
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm group-hover:shadow-cyan-500/30">
                      <span className="text-xl">{"\u{1F4E4}"}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-cyan-700">Add transaction</span>
                    <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/transactions"
                    className="group flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300"
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm group-hover:shadow-green-500/30">
                      <span className="text-xl">{"\u{1F4CA}"}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-green-700">View transactions</span>
                    <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-green-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
