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
    <div className="group bg-surface rounded-2xl border border-edge-subtle shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="p-6 border-b border-edge-subtle">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-heading">Exceptions Inbox</h2>
          {hasAnyItems && (
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm animate-pulse-slow">
              {totalInboxCount}
            </span>
          )}
        </div>
      </div>
      <div className="divide-y divide-edge-subtle">
        {hasAnyItems ? (
          <>
            {/* Overdue Invoices */}
            {overdueInvoices.length > 0 && (
              <Link
                href="/invoices?status=overdue"
                className="p-4 flex items-start gap-3 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all block group/item"
              >
                <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                  <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-red-800 dark:text-red-300">
                    {overdueInvoices.length} Overdue Invoice{overdueInvoices.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {formatCurrency(overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.balance), 0))} outstanding
                  </p>
                </div>
                <span className="flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-800">
                  Overdue
                </span>
              </Link>
            )}
            {/* Overdue Bills */}
            {overdueBills.length > 0 && (
              <Link
                href="/bills?status=overdue"
                className="p-4 flex items-start gap-3 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all block group/item"
              >
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                  <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    {overdueBills.length} Overdue Bill{overdueBills.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {formatCurrency(overdueBills.reduce((sum, b) => sum + parseFloat(b.balance), 0))} owed
                  </p>
                </div>
                <span className="flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-200 dark:ring-amber-800">
                  Overdue
                </span>
              </Link>
            )}
            {/* Transaction Exceptions */}
            {summary.exceptions.slice(0, 10).map((txn) => (
              <Link
                key={txn.id}
                href={`/transactions?status=${txn.status}`}
                className="p-4 flex items-start gap-3 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 dark:hover:from-cyan-900/10 dark:hover:to-teal-900/10 transition-all block group/item"
              >
                <span className="text-lg flex-shrink-0 group-hover/item:scale-110 transition-transform">
                  {txn.status === "inbox_user" ? "\u{1F9FE}" : "\u{2753}"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-heading truncate">{txn.vendor_name}</p>
                  <p className="text-xs text-muted">
                    {formatCurrency(txn.amount)} &middot; {formatDate(txn.transaction_date)}
                  </p>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  txn.status === "inbox_user"
                    ? "text-amber-600 bg-amber-50 ring-1 ring-amber-200"
                    : "text-purple-600 bg-purple-50 ring-1 ring-purple-200"
                }`}>
                  {txn.status === "inbox_user" ? "Needs review" : "Firm review"}
                </span>
              </Link>
            ))}
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
              <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-muted">All caught up!</p>
          </div>
        )}
      </div>
      {summary.exceptions_count > 0 && (
        <div className="p-4 border-t border-edge-subtle">
          <Link href="/transactions?status=inbox_user" className="text-sm font-bold text-cyan-600 hover:text-cyan-500 flex items-center gap-1 group/link">
            View all items
            <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
