"use client";

import Link from "next/link";

export function EmptyState() {
  return (
    <div className="card-financial p-12 text-center mb-8">
      <div className="mx-auto h-14 w-14 rounded-xl bg-[#EEF1F2] dark:bg-[#1C2C3A] flex items-center justify-center mb-5 text-[#087E78]">
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-heading mb-2">No ledger transactions yet</h3>
      <p className="text-sm text-muted mb-6 max-w-md mx-auto leading-relaxed">
        Start by posting your first transaction. Oluto automatically calculates Canadian GST/HST liabilities based on your business province.
      </p>
      <Link
        href="/transactions/new"
        className="btn-primary inline-flex items-center gap-2"
      >
        <span>Add First Transaction</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </div>
  );
}
