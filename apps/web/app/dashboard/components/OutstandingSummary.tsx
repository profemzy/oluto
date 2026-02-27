"use client";

import Link from "next/link";
import { DashboardSummary } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";

interface OutstandingSummaryProps {
  summary: DashboardSummary;
}

export function OutstandingSummary({ summary }: OutstandingSummaryProps) {
  const hasReceivables = parseFloat(summary.outstanding_receivables) > 0;
  const hasPayables = parseFloat(summary.outstanding_payables) > 0;

  if (!hasReceivables && !hasPayables) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      {hasReceivables && (
        <div className="bg-surface rounded-2xl border border-blue-100 p-5 shadow-md flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-body">Outstanding Receivables</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.outstanding_receivables)}</p>
            <p className="text-xs text-muted">Unpaid invoices owed to you</p>
          </div>
        </div>
      )}
      {hasPayables && (
        <div className="bg-surface rounded-2xl border border-amber-100 p-5 shadow-md flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-body">Outstanding Payables</p>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(summary.outstanding_payables)}</p>
            <p className="text-xs text-muted">Unpaid bills you owe (deducted from Safe to Spend)</p>
          </div>
        </div>
      )}
    </div>
  );
}
