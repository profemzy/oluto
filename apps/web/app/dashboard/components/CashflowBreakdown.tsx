"use client";

import { DashboardSummary } from "@/app/lib/api";
import { formatCurrency, isNegativeAmount, isPositiveAmount, parseAmountSafe } from "@/app/lib/format";

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
  const revenue = parseAmountSafe(summary.total_revenue);
  const expenses = parseAmountSafe(summary.total_expenses);
  const tax = parseAmountSafe(summary.tax_reserved);
  const safeToSpendNum = parseAmountSafe(summary.safe_to_spend);
  const isDeficit = isNegativeAmount(summary.safe_to_spend);
  const payables = parseAmountSafe(summary.outstanding_payables);
  const hasPayables = isPositiveAmount(summary.outstanding_payables);
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
    ...(hasPayables
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

  const screenReaderSummary = `Revenue ${formatCurrency(summary.total_revenue)}, expenses ${formatCurrency(summary.total_expenses)}, tax reserved ${formatCurrency(summary.tax_reserved)}, safe to spend ${formatCurrency(summary.safe_to_spend)}${isDeficit ? ", deficit" : ""}.`;

  return (
    <div className="card-financial">
      <div className="flex items-center justify-between p-5 border-b border-edge">
        <div>
          <h2 className="text-base font-bold text-heading">Cashflow Breakdown</h2>
          <p className="text-xs text-muted mt-0.5">Real-time operating margin & tax allocations</p>
        </div>
        {isDeficit && (
          <span className="status-badge status-badge-critical" role="status" aria-label="Deficit: tax lock and bills exceed cash">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Deficit
          </span>
        )}
      </div>
      <p className="sr-only" role="status">{screenReaderSummary}</p>

      <div className="p-5 space-y-4" role="img" aria-label={screenReaderSummary}>
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

            <div className="h-2 w-full bg-surface-tertiary rounded-sm overflow-hidden" aria-hidden="true">
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
