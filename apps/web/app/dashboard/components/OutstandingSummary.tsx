"use client";

import Link from "next/link";
import { DashboardSummary } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";

interface OutstandingSummaryProps {
  summary: DashboardSummary;
}

export function OutstandingSummary({ summary }: OutstandingSummaryProps) {
  const hasReceivables = parseFloat(summary.outstanding_receivables || "0") > 0;
  const hasPayables = parseFloat(summary.outstanding_payables || "0") > 0;

  if (!hasReceivables && !hasPayables) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {hasReceivables && (
        <Link
          href="/invoices"
          className="card-financial p-4 flex items-center justify-between hover:bg-surface-hover transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-md bg-[#EFF6FC] dark:bg-[#0C2338] text-[#315E8A] dark:text-[#60A5FA] flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Receivables Due</p>
              <p className="text-xl font-bold font-tabular text-heading mt-0.5">
                {formatCurrency(summary.outstanding_receivables)}
              </p>
              <p className="text-[11px] text-muted truncate">Uncollected customer invoices</p>
            </div>
          </div>

          <svg className="w-4 h-4 text-muted group-hover:text-heading transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {hasPayables && (
        <Link
          href="/bills"
          className="card-financial p-4 flex items-center justify-between hover:bg-surface-hover transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-md bg-[#FEF3F2] dark:bg-[#2E0D0B] text-[#B42318] dark:text-[#F87171] flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Payables Committed</p>
              <p className="text-xl font-bold font-tabular text-[#B42318] dark:text-[#F87171] mt-0.5">
                {formatCurrency(summary.outstanding_payables)}
              </p>
              <p className="text-[11px] text-muted truncate">Unpaid vendor bills</p>
            </div>
          </div>

          <svg className="w-4 h-4 text-muted group-hover:text-heading transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
