"use client";

import { DashboardSummary } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";

interface CashflowBreakdownProps {
  summary: DashboardSummary;
}

interface BarData {
  label: string;
  value: number;
  color: string;
  textColor: string;
}

export function CashflowBreakdown({ summary }: CashflowBreakdownProps) {
  const revenue = parseFloat(summary.total_revenue);
  const expenses = parseFloat(summary.total_expenses);
  const tax = parseFloat(summary.tax_reserved);
  const safeToSpend = parseFloat(summary.safe_to_spend);
  const payables = parseFloat(summary.outstanding_payables);
  const maxVal = Math.max(revenue, expenses, tax, Math.abs(safeToSpend), 1);

  const bars: BarData[] = [
    { label: "Revenue", value: revenue, color: "bg-emerald-500", textColor: "text-emerald-700" },
    { label: "Expenses", value: expenses, color: "bg-red-400", textColor: "text-red-700" },
    { label: "CRA Lock (Net)", value: tax, color: "bg-cyan-500", textColor: "text-cyan-700" },
    ...(payables > 0 ? [{ label: "Unpaid Bills", value: payables, color: "bg-amber-400", textColor: "text-amber-700" }] : []),
    { label: "Safe to Spend", value: Math.abs(safeToSpend), color: safeToSpend >= 0 ? "bg-gradient-to-r from-cyan-400 to-teal-400" : "bg-amber-400", textColor: safeToSpend >= 0 ? "text-teal-700" : "text-amber-700" },
  ];

  return (
    <div className="group bg-surface rounded-2xl border border-edge-subtle shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="p-6 border-b border-edge-subtle">
        <h2 className="text-lg font-bold text-heading">Cashflow Breakdown</h2>
      </div>
      <div className="p-6 space-y-5">
        {bars.map((bar) => (
          <div key={bar.label} className="group/bar">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-body">{bar.label}</span>
              <span className={`text-sm font-bold ${bar.textColor}`}>
                {formatCurrency(bar.value)}
              </span>
            </div>
            <div className="h-3 bg-surface-tertiary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${bar.color} group-hover/bar:opacity-80`}
                style={{ width: `${maxVal > 0 ? Math.max((bar.value / maxVal) * 100, 2) : 0}%` }}
              />
            </div>
          </div>
        ))}
        <div className="pt-4 border-t border-edge-subtle">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Expense ratio</span>
            <span className="font-bold text-body">
              {revenue > 0
                ? `${Math.round((expenses / revenue) * 100)}%`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
