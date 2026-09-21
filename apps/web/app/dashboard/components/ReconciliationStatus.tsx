"use client";

import Link from "next/link";
import { ReconciliationSummary } from "@/app/lib/api";

interface ReconciliationStatusProps {
  reconSummary: ReconciliationSummary;
}

export function ReconciliationStatus({ reconSummary }: ReconciliationStatusProps) {
  if (reconSummary.unreconciled === 0) return null;

  return (
    <Link
      href="/reconciliation"
      className="card-financial p-5 flex items-center gap-4 hover:border-[#087E78] transition-colors block group"
    >
      <div className="h-10 w-10 rounded-lg bg-[#FEFBE8] dark:bg-[#382805] text-[#9A6700] dark:text-[#FBBF24] flex items-center justify-center flex-shrink-0">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-heading">
          {reconSummary.unreconciled} Unreconciled Transaction{reconSummary.unreconciled !== 1 ? "s" : ""}
        </p>
        {(reconSummary.suggested_matches || 0) > 0 && (
          <p className="text-xs text-muted">
            {reconSummary.suggested_matches} suggested match{reconSummary.suggested_matches !== 1 ? "es" : ""} ready
          </p>
        )}
      </div>
      <svg className="w-4 h-4 text-muted group-hover:text-heading transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
