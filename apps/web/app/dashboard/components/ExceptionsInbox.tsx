"use client";

import Link from "next/link";
import { DashboardSummary, Invoice, Bill } from "@/app/lib/api";
import { formatCurrency, formatDate } from "@/app/lib/format";

interface ExceptionsInboxProps {
  summary: DashboardSummary;
  overdueInvoices: Invoice[];
  overdueBills: Bill[];
}

export function ExceptionsInbox({ summary, overdueInvoices, overdueBills }: ExceptionsInboxProps) {
  const totalInboxCount = summary.exceptions_count + overdueInvoices.length + overdueBills.length;
  const hasAnyItems = totalInboxCount > 0;

  return (
    <div className="card-financial">
      <div className="p-5 border-b border-edge flex items-center justify-between">
        <h2 className="text-base font-bold text-heading">Exceptions Inbox</h2>
        {hasAnyItems && (
          <span className="status-badge status-badge-warning font-tabular">
            {totalInboxCount}
          </span>
        )}
      </div>

      <div className="divide-y divide-edge">
        {hasAnyItems ? (
          <>
            {/* Overdue Invoices */}
            {overdueInvoices.length > 0 && (
              <Link
                href="/invoices?status=overdue"
                className="p-4 flex items-start gap-3 hover:bg-[var(--surface-secondary)] transition-colors block"
              >
                <div className="h-8 w-8 rounded-lg bg-[#FEF3F2] dark:bg-[#3D1418] text-[#B42318] dark:text-[#F87171] flex items-center justify-center flex-shrink-0">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">
                    {overdueInvoices.length} Overdue Invoice{overdueInvoices.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted font-tabular">
                    {formatCurrency(overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.balance), 0))} outstanding
                  </p>
                </div>
                <span className="status-badge status-badge-critical">
                  Overdue
                </span>
              </Link>
            )}

            {/* Overdue Bills */}
            {overdueBills.length > 0 && (
              <Link
                href="/bills?status=overdue"
                className="p-4 flex items-start gap-3 hover:bg-[var(--surface-secondary)] transition-colors block"
              >
                <div className="h-8 w-8 rounded-lg bg-[#FEFBE8] dark:bg-[#382805] text-[#9A6700] dark:text-[#FBBF24] flex items-center justify-center flex-shrink-0">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">
                    {overdueBills.length} Overdue Bill{overdueBills.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted font-tabular">
                    {formatCurrency(overdueBills.reduce((sum, b) => sum + parseFloat(b.balance), 0))} committed
                  </p>
                </div>
                <span className="status-badge status-badge-warning">
                  Overdue
                </span>
              </Link>
            )}

            {/* Transaction Exceptions */}
            {summary.exceptions.slice(0, 10).map((txn) => (
              <Link
                key={txn.id}
                href={`/transactions?status=${txn.status}`}
                className="p-4 flex items-start gap-3 hover:bg-[var(--surface-secondary)] transition-colors block"
              >
                <div className="h-8 w-8 rounded-lg bg-[#E6F4F2] dark:bg-[#073836] text-[#087E78] dark:text-[#2DD4BF] flex items-center justify-center flex-shrink-0">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading truncate">
                    {txn.vendor_name || "Unlabelled transaction"}
                  </p>
                  <p className="text-xs text-muted font-tabular">
                    {formatCurrency(txn.amount)} &middot; {formatDate(txn.transaction_date)}
                  </p>
                </div>
                <span className={`status-badge ${txn.status === "inbox_user" ? "status-badge-warning" : "status-badge-neutral"}`}>
                  {txn.status === "inbox_user" ? "Needs review" : "Firm review"}
                </span>
              </Link>
            ))}
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-[#E6F4EA] dark:bg-[#0E3824] text-[#177245] dark:text-[#34D399] flex items-center justify-center mb-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-muted">All ledger entries verified. No exceptions.</p>
          </div>
        )}
      </div>

      {summary.exceptions_count > 0 && (
        <div className="p-4 border-t border-edge bg-[var(--surface-secondary)]">
          <Link href="/transactions?status=inbox_user" className="text-xs font-semibold text-[#087E78] hover:underline flex items-center gap-1">
            <span>View all exceptions</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
