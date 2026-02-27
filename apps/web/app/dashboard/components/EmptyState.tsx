"use client";

import Link from "next/link";

export function EmptyState() {
  return (
    <div className="relative bg-surface rounded-2xl border border-edge-subtle shadow-lg p-12 text-center mb-8 overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-cyan-200 to-green-200 dark:from-cyan-800 dark:to-green-800 rounded-full opacity-20 blur-3xl animate-float-slow" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-teal-200 to-emerald-200 dark:from-teal-800 dark:to-emerald-800 rounded-full opacity-20 blur-3xl animate-float" />
      <div className="relative z-10">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center mb-6 shadow-lg hover:shadow-cyan-500/50 hover:scale-110 transition-all duration-300 cursor-pointer">
          <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-heading mb-3">No transactions yet</h3>
        <p className="text-sm text-body mb-8 max-w-md mx-auto leading-relaxed">
          Start by adding your first transaction. Oluto will <span className="font-semibold">automatically calculate taxes</span> based on your province.
        </p>
        <Link
          href="/transactions/new"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all duration-300 btn-glow"
        >
          Add Your First Transaction
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
