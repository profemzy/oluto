"use client";

import { DashboardSummary } from "@/app/lib/api";
import { formatCurrency, isNegativeAmount, isPositiveAmount, parseAmountSafe } from "@/app/lib/format";

interface DashboardStatsProps {
  summary: DashboardSummary | null;
  hasTransactions: boolean;
}

export function DashboardStats({ summary, hasTransactions }: DashboardStatsProps) {
  const safeToSpend = summary?.safe_to_spend ?? "0.00";
  const isDeficit = isNegativeAmount(safeToSpend);

  const revenueNum = parseAmountSafe(summary?.total_revenue);
  const expenseNum = parseAmountSafe(summary?.total_expenses);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
      {/* 1. Safe to Spend */}
      <div className={`card-financial p-5 border-l-4 ${isDeficit ? "border-l-[#B42318]" : "border-l-[#087E78]"}`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Safe to Spend</p>
          <span
            className={`status-badge text-[10px] ${
              isDeficit ? "status-badge-critical" : "status-badge-positive"
            }`}
            role="status"
            aria-label={isDeficit ? "Deficit: tax lock and bills exceed cash" : "Available to spend"}
          >
            {isDeficit && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            {isDeficit ? "Deficit" : "Available"}
          </span>
        </div>

        <p
          className={`mt-2 text-2xl sm:text-3xl font-bold font-tabular tracking-tight ${
            isDeficit ? "text-[#B42318] dark:text-[#F87171]" : "text-heading"
          }`}
        >
          {formatCurrency(safeToSpend)}
        </p>

        <p className="mt-2 text-xs text-muted">
          {isDeficit
            ? "Tax lock and bills exceed cash"
            : "After CRA reservation & open bills"}
        </p>
      </div>

      {/* 2. CRA Tax Lockbox */}
      <div className="card-financial p-5 border-l-4 border-l-[#9A6700]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">CRA Tax Lockbox</p>
          <span className="status-badge status-badge-warning text-[10px]">
            Reserved
          </span>
        </div>

        <p className="mt-2 text-2xl sm:text-3xl font-bold font-tabular tracking-tight text-heading">
          {formatCurrency(summary?.tax_reserved ?? "0.00")}
        </p>

        <div className="mt-2 text-xs text-muted flex items-center gap-1 font-tabular">
          <span>Collected: {formatCurrency(summary?.tax_collected ?? "0.00")}</span>
          <span>&minus;</span>
          <span>ITCs: {formatCurrency(summary?.tax_itc ?? "0.00")}</span>
        </div>
      </div>

      {/* 3. Operating Revenue */}
      <div className="card-financial p-5 border-l-4 border-l-[#177245]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Revenue</p>
          <span className="status-badge status-badge-positive text-[10px]">
            Posted
          </span>
        </div>

        <p className="mt-2 text-2xl sm:text-3xl font-bold font-tabular tracking-tight text-heading">
          {formatCurrency(summary?.total_revenue ?? "0.00")}
        </p>

        <p className="mt-2 text-xs text-muted">
          {summary && isPositiveAmount(summary.payments_received)
            ? `Incl. ${formatCurrency(summary.payments_received)} in cash received`
            : `${summary?.transactions_count || 0} total ledger transaction${summary?.transactions_count === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* 4. Operating Expenses */}
      <div className="card-financial p-5 border-l-4 border-l-[#5B6874]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Expenses</p>
          <span className="status-badge status-badge-neutral text-[10px]">
            Operating
          </span>
        </div>

        <p className="mt-2 text-2xl sm:text-3xl font-bold font-tabular tracking-tight text-heading">
          {formatCurrency(summary?.total_expenses ?? "0.00")}
        </p>

        <p className="mt-2 text-xs text-muted font-tabular">
          {hasTransactions && revenueNum > 0
            ? `${Math.round((expenseNum / revenueNum) * 100)}% of revenue`
            : "No posted expenses"}
        </p>
      </div>
    </div>
  );
}
