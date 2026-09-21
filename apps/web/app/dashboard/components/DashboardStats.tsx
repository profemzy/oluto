"use client";

import { DashboardSummary } from "@/app/lib/api";
import { formatCurrency, isNegativeAmount } from "@/app/lib/format";

interface DashboardStatsProps {
  summary: DashboardSummary | null;
  hasTransactions: boolean;
}

export function DashboardStats({ summary, hasTransactions }: DashboardStatsProps) {
  const safeToSpend = summary?.safe_to_spend ?? "0.00";
  const isDeficit = isNegativeAmount(safeToSpend) || parseFloat(safeToSpend) < 0;

  const revenueNum = parseFloat(summary?.total_revenue || "0");
  const expenseNum = parseFloat(summary?.total_expenses || "0");

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
          >
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
          {summary && parseFloat(summary.payments_received || "0") > 0
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
