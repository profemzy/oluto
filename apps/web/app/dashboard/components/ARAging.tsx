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
    { label: "Current", value: totals.current, color: "text-[#177245] dark:text-[#34D399]" },
    { label: "1–30 days", value: totals.days_1_30, color: "text-heading" },
    { label: "31–60 days", value: totals.days_31_60, color: "text-[#9A6700] dark:text-[#FBBF24]" },
    { label: "61–90 days", value: totals.days_61_90, color: "text-[#C05621] dark:text-[#FB923C]" },
    { label: "90+ days", value: totals.days_91_plus, color: "text-[#B42318] dark:text-[#F87171]" },
  ].filter((b) => b.value > 0);

  return (
    <div className="card-financial">
      <div className="p-5 border-b border-edge flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">AR Aging Summary</h2>
        <span className="text-xs text-muted font-tabular">as of {formatDate(arAging.as_of_date)}</span>
      </div>
      <div className="p-5 space-y-3">
        {buckets.map((b) => (
          <div key={b.label} className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted">{b.label}</span>
            <span className={`font-semibold font-tabular ${b.color}`}>{formatCurrency(b.value)}</span>
          </div>
        ))}
        <div className="pt-3 border-t border-edge flex items-center justify-between">
          <span className="text-xs font-bold text-heading uppercase tracking-wider">Total AR</span>
          <span className="text-sm font-bold font-tabular text-heading">{formatCurrency(totals.total)}</span>
        </div>
      </div>
      <div className="p-4 border-t border-edge bg-[var(--surface-secondary)]">
        <Link href="/reports/ar-aging" className="text-xs font-semibold text-[#087E78] hover:underline flex items-center gap-1">
          <span>Full aging report</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
