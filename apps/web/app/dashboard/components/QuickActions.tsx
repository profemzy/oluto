"use client";

import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";

interface QuickActionItem {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export function QuickActions() {
  const { canWrite, loading } = useAuth({ requireBusiness: false });

  // High-frequency mutations for write-permitted roles (Accountant, Admin, Owner)
  const writeActions: QuickActionItem[] = [
    {
      href: "/transactions/new",
      label: "Add Transaction",
      description: "Post a manual entry or debit/credit",
      icon: (
        <svg className="w-4 h-4 text-[#087E78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      href: "/invoices/new",
      label: "Create Invoice",
      description: "Bill a customer with Canadian tax calculation",
      icon: (
        <svg className="w-4 h-4 text-[#087E78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      href: "/payments/new",
      label: "Record Payment",
      description: "Register received customer cash or wire",
      icon: (
        <svg className="w-4 h-4 text-[#087E78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      href: "/bills/new",
      label: "Create Bill",
      description: "Log vendor invoice for payment queue",
      icon: (
        <svg className="w-4 h-4 text-[#087E78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      href: "/reports",
      label: "Financial Statements",
      description: "Income statement, balance sheet & tax summary",
      icon: (
        <svg className="w-4 h-4 text-[#087E78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  // Read-only actions for viewers
  const readOnlyActions: QuickActionItem[] = [
    {
      href: "/reports",
      label: "Financial Statements",
      description: "Review P&L, balance sheet, and tax lock",
      icon: (
        <svg className="w-4 h-4 text-[#087E78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: "/accounts",
      label: "Chart of Accounts",
      description: "Inspect balance history and account structure",
      icon: (
        <svg className="w-4 h-4 text-[#087E78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      ),
    },
    {
      href: "/transactions",
      label: "Audit Ledger",
      description: "Browse posted entries and reconciliation state",
      icon: (
        <svg className="w-4 h-4 text-[#087E78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
    },
    {
      href: "/daily-briefings",
      label: "Daily Briefings",
      description: "Morning financial summary and cash health",
      icon: (
        <svg className="w-4 h-4 text-[#087E78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
  ];

  const actions = !loading && !canWrite ? readOnlyActions : writeActions;

  return (
    <div className="card-financial">
      <div className="flex items-center justify-between p-4 border-b border-edge">
        <div>
          <h2 className="text-sm font-bold text-heading">
            {!loading && !canWrite ? "Quick Navigation" : "Quick Operations"}
          </h2>
          <p className="text-[11px] text-muted">
            {!loading && !canWrite ? "Read-only access shortcuts" : "Direct financial ledger entries"}
          </p>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center justify-between p-2.5 rounded-md border border-edge-subtle hover:border-edge hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded bg-surface-tertiary flex items-center justify-center flex-shrink-0 group-hover:bg-[#087E78]/10 transition-colors">
                {action.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-heading group-hover:text-[#087E78] transition-colors truncate">
                  {action.label}
                </p>
                <p className="text-[10px] text-muted truncate">
                  {action.description}
                </p>
              </div>
            </div>

            <svg className="w-3.5 h-3.5 text-muted group-hover:text-heading transition-transform group-hover:translate-x-0.5 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
