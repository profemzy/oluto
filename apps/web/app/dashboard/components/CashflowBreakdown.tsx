"use client";

import { DashboardSummary } from "@/app/lib/api";
import { formatCurrency, isNegativeAmount } from "@/app/lib/format";

interface CashflowBreakdownProps {
  summary: DashboardSummary;
}

interface BarData {
  label: string;
  displayValue: string;
  numericVal: number;
  color: string;
  textColor: string;
  badge?: string;
}

export function CashflowBreakdown({ summary }: CashflowBreakdownProps) {
  const revenue = parseFloat(summary.total_revenue || "0");
  const expenses = parseFloat(summary.total_expenses || "0");
  const tax = parseFloat(summary.tax_reserved || "0");
  const safeToSpendNum = parseFloat(summary.safe_to_spend || "0");
  const isDeficit = isNegativeAmount(summary.safe_to_spend) || safeToSpendNum < 0;
  const payables = parseFloat(summary.outstanding_payables || "0");
  const maxVal = Math.max(revenue, expenses, Math.abs(tax), Math.abs(safeToSpendNum), payables, 1);

  const bars: BarData[] = [
    {
      label: "Revenue",
      displayValue: formatCurrency(summary.total_revenue),
      numericVal: Math.max(0, revenue),
      color: "bg-[#177245]",
      textColor: "text-[#177245] dark:text-[#34d399]",
    },
    {
      label: "Operating Expenses",
      displayValue: formatCurrency(summary.total_expenses),
      numericVal: Math.max(0, expenses),
      color: "bg-[#b42318]",
      textColor: "text-[#b42318] dark:text-[#f87171]",
    },
    {
      label: "CRA Tax Lock (Net GST/HST)",
      displayValue: formatCurrency(summary.tax_reserved),
      numericVal: Math.max(0, Math.abs(tax)),
      color: "bg-[#9a6700]",
      textColor: "text-[#9a6700] dark:text-[#fbbf24]",
      badge: "Reserved",
    },
    ...(payables > 0
      ? [
          {
            label: "Unpaid Bills (Payables)",
            displayValue: formatCurrency(summary.outstanding_payables),
            numericVal: payables,
            color: "bg-[#b42318]",
            textColor: "text-[#b42318] dark:text-[#f87171]",
          },
        ]
      : []),
    {
      label: isDeficit ? "Safe to Spend (Deficit / Tax Locked)" : "Safe to Spend",
      displayValue: formatCurrency(summary.safe_to_spend),
      numericVal: Math.max(0, Math.abs(safeToSpendNum)),
      color: isDeficit ? "bg-[#b42318]" : "bg-[#087e78]",
      textColor: isDeficit
        ? "text-[#b42318] dark:text-[#f87171]"
        : "text-[#087e78] dark:text-[#14b8a6]",
      badge: isDeficit ? "Action Required" : undefined,
    },
  ];

  return (
    <div className="card-financial">
      <div className="flex items-center justify-between p-5 border-b border-edge">
        <div>
          <h2 className="text-base font-bold text-heading">Cashflow Breakdown</h2>
          <p className="text-xs text-muted mt-0.5">Real-time operating margin & tax allocations</p>
        </div>
        {isDeficit && (
          <span className="status-badge status-badge-critical">
            Deficit
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-center justify-between mb-1.5 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="text-body font-semibold">{bar.label}</span>
                {bar.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-surface-tertiary text-muted border border-edge-subtle">
                    {bar.badge}
                  </span>
                )}
              </div>
              <span className={`font-tabular font-bold text-sm ${bar.textColor}`}>
                {bar.displayValue}
              </span>
            </div>

            <div className="h-2 w-full bg-surface-tertiary rounded-sm overflow-hidden">
              <div
                className={`h-full ${bar.color} rounded-sm transition-all duration-300`}
                style={{ width: `${Math.min(100, Math.max(3, (bar.numericVal / maxVal) * 100))}%` }}
              />
            </div>
          </div>
        ))}

        <div className="pt-3 border-t border-edge-subtle flex items-center justify-between text-xs text-muted">
          <span>Operating Expense Ratio</span>
          <span className="font-tabular font-bold text-heading">
            {revenue > 0 ? `${Math.round((expenses / revenue) * 100)}%` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
