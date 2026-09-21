"use client";

import Link from "next/link";
import { Transaction } from "@/app/lib/api";
import { formatCurrency, formatRelativeTime } from "@/app/lib/format";

interface RecentActivityProps {
  transactions: Transaction[];
}

function StatusIndicator({ status }: { status: string }) {
  if (status === "posted") {
    return (
      <span className="status-badge status-badge-positive text-[10px] py-0.5 px-1.5">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
        Posted
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="status-badge status-badge-warning text-[10px] py-0.5 px-1.5">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        </svg>
        Draft
      </span>
    );
  }
  return (
    <span className="status-badge status-badge-info text-[10px] py-0.5 px-1.5">
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Pending
    </span>
  );
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  return (
    <div className="card-financial">
      <div className="p-4 border-b border-edge flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-heading">Recent Activity</h2>
          <p className="text-[11px] text-muted">Latest verified ledger entries</p>
        </div>
      </div>

      <div className="divide-y divide-edge-subtle">
        {transactions && transactions.length > 0 ? (
          transactions.slice(0, 5).map((txn) => {
            const hasVendor = Boolean(txn.vendor_name && txn.vendor_name.trim());
            const vendorDisplay = hasVendor ? txn.vendor_name : "Unlabelled transaction";

            return (
              <div key={txn.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-hover transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-xs font-semibold truncate ${hasVendor ? "text-heading" : "text-muted italic"}`}>
                      {vendorDisplay}
                    </p>
                    <StatusIndicator status={txn.status} />
                  </div>
                  <p className="text-[11px] text-muted" suppressHydrationWarning>
                    {txn.created_at ? formatRelativeTime(txn.created_at) : "—"}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-tabular text-xs font-bold text-heading block">
                    {formatCurrency(txn.amount)}
                  </span>
                  <span className="text-[10px] text-muted uppercase font-mono">
                    CAD
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-xs text-muted">
            No recent activity recorded
          </div>
        )}
      </div>

      <div className="p-3 border-t border-edge-subtle bg-surface-tertiary rounded-b-lg">
        <Link
          href="/transactions"
          className="text-xs font-semibold text-[#087E78] hover:text-[#066762] flex items-center justify-between"
        >
          <span>View all ledger entries</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
