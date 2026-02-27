"use client";

import Link from "next/link";
import { Transaction } from "@/app/lib/api";
import { formatCurrency, formatRelativeTime } from "@/app/lib/format";

interface RecentActivityProps {
  transactions: Transaction[];
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  return (
    <div className="group bg-surface rounded-2xl border border-edge-subtle shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="p-6 border-b border-edge-subtle">
        <h2 className="text-lg font-bold text-heading">Recent Transactions</h2>
      </div>
      <div className="p-4 space-y-4">
        {transactions.length > 0 ? (
          transactions.map((txn) => (
            <div key={txn.id} className="flex items-center gap-3 group/txn">
              <span className="text-lg group-hover/txn:scale-110 transition-transform">
                {txn.status === "posted" ? "\u{2705}" : txn.status === "draft" ? "\u{1F4DD}" : "\u{1F4E5}"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-heading truncate">{txn.vendor_name}</p>
                <p className="text-xs text-muted" suppressHydrationWarning>
                  {formatCurrency(txn.amount)} &middot; {txn.created_at ? formatRelativeTime(txn.created_at) : ""}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted text-center py-2">No recent activity</p>
        )}
      </div>
      <div className="p-4 border-t border-edge-subtle">
        <Link href="/transactions" className="text-sm font-bold text-cyan-600 hover:text-cyan-500 flex items-center gap-1 group/link">
          View all transactions
          <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
