"use client";

import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader } from "@/app/components";

const REPORTS = [
  {
    name: "Trial Balance",
    description: "Verify that debits equal credits across all accounts",
    href: "/reports/trial-balance",
    color: "from-cyan-500 to-teal-500",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
  {
    name: "Profit & Loss",
    description: "Revenue vs expenses over a date range",
    href: "/reports/profit-loss",
    color: "from-emerald-500 to-teal-500",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
  {
    name: "Balance Sheet",
    description: "Assets, liabilities, and equity at a point in time",
    href: "/reports/balance-sheet",
    color: "from-blue-500 to-cyan-500",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
  },
  {
    name: "AR Aging",
    description: "Accounts receivable aging by customer",
    href: "/reports/ar-aging",
    color: "from-amber-500 to-orange-500",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

export default function ReportsPage() {
  const { loading: authLoading } = useAuth();

  if (authLoading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-secondary relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader title="Reports" subtitle="Financial reports and analysis" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {REPORTS.map((report) => (
            <Link
              key={report.name}
              href={report.href}
              className="group bg-surface rounded-2xl border border-edge-subtle shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={report.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-heading group-hover:text-cyan-700 transition-colors">{report.name}</h3>
              <p className="text-sm text-muted mt-1">{report.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
