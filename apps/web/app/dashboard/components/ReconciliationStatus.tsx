"use client";

import Link from "next/link";
import { ReconciliationSummary } from "@/app/lib/api";

interface ReconciliationStatusProps {
  reconSummary: ReconciliationSummary;
}

export function ReconciliationStatus({ reconSummary }: ReconciliationStatusProps) {
  if (reconSummary.unreconciled === 0) return null;

  return (
    <Link href="/reconciliation" className="group block bg-surface rounded-2xl border border-amber-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="p-6 flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800">
            {reconSummary.unreconciled || 0} Unreconciled Transaction{(reconSummary.unreconciled || 0) !== 1 ? "s" : ""}
          </p>
          {(reconSummary.suggested_matches || 0) > 0 && (
            <p className="text-xs text-amber-600">
              {reconSummary.suggested_matches} suggested match{(reconSummary.suggested_matches || 0) !== 1 ? "es" : ""}
            </p>
          )}
        </div>
        <svg className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
