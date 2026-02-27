"use client";

import { DashboardSummary } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";

interface DashboardStatsProps {
  summary: DashboardSummary | null;
  hasTransactions: boolean;
}

export function DashboardStats({ summary, hasTransactions }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Safe to Spend */}
      <div className="group bg-surface rounded-2xl border border-edge-subtle p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-10 blur-xl group-hover:opacity-20 group-hover:scale-125 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <p className="text-sm font-semibold text-body">Safe to Spend</p>
          {hasTransactions && (
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm animate-pulse-slow">
              Available
            </span>
          )}
        </div>
        <p className="mt-3 text-4xl font-black bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent relative z-10 group-hover:scale-105 transition-transform origin-left">
          {summary ? formatCurrency(summary.safe_to_spend) : "$0.00"}
        </p>
        <div className="mt-5 h-2.5 bg-surface-tertiary rounded-full overflow-hidden relative z-10">
          <div className="h-full w-3/4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-sm" />
        </div>
      </div>

      {/* CRA Lockbox */}
      <div className="group bg-surface rounded-2xl border border-edge-subtle p-6 shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full opacity-10 blur-xl group-hover:opacity-20 group-hover:scale-125 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <p className="text-sm font-semibold text-body">CRA Lockbox</p>
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            Net Owed
          </span>
        </div>
        <p className="mt-3 text-4xl font-black bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent relative z-10 group-hover:scale-105 transition-transform origin-left">
          {summary ? formatCurrency(summary.tax_reserved) : "$0.00"}
        </p>
        {summary && hasTransactions && (
          <div className="mt-2 space-y-0.5 relative z-10">
            <p className="text-xs text-muted">
              Collected: <span className="font-semibold text-body">{formatCurrency(summary.tax_collected)}</span>
              {" "}&minus;{" "}ITCs: <span className="font-semibold text-green-600">{formatCurrency(summary.tax_itc)}</span>
            </p>
          </div>
        )}
        {!(summary && hasTransactions) && (
          <p className="mt-2 text-xs font-medium text-muted relative z-10">GST/HST collected &minus; ITCs</p>
        )}
      </div>

      {/* Revenue */}
      <div className="group bg-surface rounded-2xl border border-edge-subtle p-6 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full opacity-10 blur-xl group-hover:opacity-20 group-hover:scale-125 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <p className="text-sm font-semibold text-body">Revenue</p>
          {hasTransactions && (
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              Posted
            </span>
          )}
        </div>
        <p className="mt-3 text-4xl font-black text-heading relative z-10 group-hover:scale-105 transition-transform origin-left">
          {summary ? formatCurrency(summary.total_revenue) : "$0.00"}
        </p>
        <p className="mt-2 text-xs font-medium text-muted relative z-10">
          {summary && parseFloat(summary.payments_received) > 0
            ? `Incl. ${formatCurrency(summary.payments_received)} in payments`
            : summary ? `${summary.transactions_count} transaction${summary.transactions_count === 1 ? "" : "s"}` : "No transactions yet"}
        </p>
      </div>

      {/* Expenses */}
      <div className="group bg-surface rounded-2xl border border-edge-subtle p-6 shadow-lg shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full opacity-10 blur-xl group-hover:opacity-20 group-hover:scale-125 transition-all duration-500" />
        <div className="flex items-center justify-between relative z-10">
          <p className="text-sm font-semibold text-body">Expenses</p>
          {hasTransactions && (
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              Posted
            </span>
          )}
        </div>
        <p className="mt-3 text-4xl font-black text-heading relative z-10 group-hover:scale-105 transition-transform origin-left">
          {summary ? formatCurrency(summary.total_expenses) : "$0.00"}
        </p>
        <p className="mt-2 text-xs font-medium text-muted relative z-10">
          {hasTransactions && parseFloat(summary!.total_revenue) > 0
            ? `${Math.round((parseFloat(summary!.total_expenses) / parseFloat(summary!.total_revenue)) * 100)}% of revenue`
            : ""}
        </p>
      </div>
    </div>
  );
}
