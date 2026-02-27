"use client";

import Link from "next/link";
import { AccountsReceivableAging, computeAgingTotals } from "@/app/lib/api";
import { formatCurrency, formatDate } from "@/app/lib/format";

interface ARAgingProps {
  arAging: AccountsReceivableAging;
}

interface AgingBucket {
  label: string;
  value: number;
  color: string;
}

export function ARAging({ arAging }: ARAgingProps) {
  const totals = computeAgingTotals(arAging);

  if (totals.total <= 0) return null;

  const buckets: AgingBucket[] = [
    { label: "Current", value: totals.current, color: "text-green-600" },
    { label: "1\u201330 days", value: totals.days_1_30, color: "text-blue-600" },
    { label: "31\u201360 days", value: totals.days_31_60, color: "text-amber-600" },
    { label: "61\u201390 days", value: totals.days_61_90, color: "text-orange-600" },
    { label: "90+ days", value: totals.days_91_plus, color: "text-red-600" },
  ].filter((b) => b.value > 0);

  return (
    <div className="group bg-surface rounded-2xl border border-edge-subtle shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="p-6 border-b border-edge-subtle">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-heading">AR Aging</h2>
          <span className="text-xs font-medium text-muted">as of {formatDate(arAging.as_of_date)}</span>
        </div>
      </div>
      <div className="p-6 space-y-3">
        {buckets.map((b) => (
          <div key={b.label} className="flex items-center justify-between">
            <span className="text-sm text-body">{b.label}</span>
            <span className={`text-sm font-bold ${b.color}`}>{formatCurrency(b.value)}</span>
          </div>
        ))}
        <div className="pt-3 border-t border-edge-subtle flex items-center justify-between">
          <span className="text-sm font-bold text-heading">Total</span>
          <span className="text-sm font-bold text-heading">{formatCurrency(totals.total)}</span>
        </div>
      </div>
      <div className="p-4 border-t border-edge-subtle">
        <Link href="/reports/ar-aging" className="text-sm font-bold text-cyan-600 hover:text-cyan-500 flex items-center gap-1 group/link">
          Full aging report
          <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
