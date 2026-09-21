"use client";

import { useState, ReactNode } from "react";

export interface QuickAction {
  label: string;
  prompt: string;
  description: string;
  category: "cash" | "payables" | "receivables" | "compliance";
  badge: "Read Data" | "Draft" | "Draft - Requires Approval";
  icon: ReactNode;
  needsFile?: boolean;
}

// Institutional financial icons
const BellIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TaxIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export const QUICK_ACTIONS: QuickAction[] = [
  // Cash & Liquidity
  {
    label: "Daily Financial Briefing",
    description: "Operating cash position, upcoming bills, and reconciliation status",
    prompt: "Give me today's daily briefing",
    category: "cash",
    badge: "Read Data",
    icon: <BellIcon />,
  },
  {
    label: "Cash Position & Runway",
    description: "Current ledger balances across operating accounts",
    prompt: "What is my current cash position?",
    category: "cash",
    badge: "Read Data",
    icon: <WalletIcon />,
  },
  // Payables & Expenses
  {
    label: "Review Uncategorized Transactions",
    description: "Inspect bank transactions awaiting CRA categorization",
    prompt: "Show me all uncategorized transactions",
    category: "payables",
    badge: "Draft",
    icon: <FileTextIcon />,
  },
  {
    label: "Upload & Match Receipt",
    description: "Extract vendor, amounts, GST/PST, and draft ledger entry",
    prompt: "I'd like to upload a receipt",
    category: "payables",
    badge: "Draft - Requires Approval",
    icon: <CameraIcon />,
    needsFile: true,
  },
  {
    label: "Log Expense Purchase",
    description: "Record a business transaction with Canadian sales tax",
    prompt: "Help me log an expense",
    category: "payables",
    badge: "Draft",
    icon: <PlusCircleIcon />,
  },
  {
    label: "Import Bank Statement",
    description: "Parse CSV or PDF statement into pending bank lines",
    prompt: "I want to import a bank statement",
    category: "payables",
    badge: "Draft - Requires Approval",
    icon: <UploadIcon />,
    needsFile: true,
  },
  // Receivables & Invoicing
  {
    label: "Inspect Overdue Invoices",
    description: "Unpaid customer receivables requiring follow-up",
    prompt: "Show me overdue invoices",
    category: "receivables",
    badge: "Read Data",
    icon: <FileTextIcon />,
  },
  {
    label: "Draft Customer Invoice",
    description: "Create a compliant Canadian sales invoice with GST/HST",
    prompt: "Create an invoice for a customer",
    category: "receivables",
    badge: "Draft - Requires Approval",
    icon: <BriefcaseIcon />,
  },
  // Compliance & Reporting
  {
    label: "P&L Statement",
    description: "Generate double-entry profit & loss report for period",
    prompt: "Generate a profit and loss report",
    category: "compliance",
    badge: "Read Data",
    icon: <TrendingUpIcon />,
  },
  {
    label: "CRA Tax & GST/HST Remittance",
    description: "Review net tax collected and input tax credits (ITCs)",
    prompt: "Show me my tax summary for CRA",
    category: "compliance",
    badge: "Read Data",
    icon: <TaxIcon />,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  cash: "Cash & Liquidity",
  payables: "Payables & Expenses",
  receivables: "Receivables & Billing",
  compliance: "CRA & Reporting",
};

interface QuickActionsProps {
  variant: "welcome" | "compact";
  onSelect: (action: QuickAction) => void;
  canWrite?: boolean;
}

export function QuickActions({ variant, onSelect, canWrite = true }: QuickActionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = ["cash", "payables", "receivables", "compliance"] as const;

  const filteredActions = selectedCategory
    ? QUICK_ACTIONS.filter((a) => a.category === selectedCategory)
    : QUICK_ACTIONS;

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-1.5 p-2">
        {QUICK_ACTIONS.slice(0, 5).map((action) => {
          const isDisabled = !canWrite && action.badge !== "Read Data";
          return (
            <button
              key={action.label}
              type="button"
              disabled={isDisabled}
              aria-label={isDisabled ? `${action.label} (Requires edit permission)` : action.label}
              onClick={() => onSelect(action)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface border border-edge hover:bg-surface-secondary text-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
            >
              <span className="text-muted">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Welcome variant — task-oriented institutional list
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 text-left">
      <div className="flex items-center justify-between pb-2 border-b border-edge">
        <div>
          <h3 className="text-sm font-bold text-heading">What needs attention?</h3>
          <p className="text-xs text-muted">
            Execute bounded workflows backed by LedgerForge verification.
          </p>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          aria-label="Filter tasks by All Tasks"
          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] ${
            selectedCategory === null
              ? "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 ring-1 ring-teal-600"
              : "bg-surface border border-edge text-muted hover:text-heading hover:bg-surface-hover"
          }`}
        >
          All Tasks
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            aria-label={`Filter tasks by ${CATEGORY_LABELS[cat]}`}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] ${
              selectedCategory === cat
                ? "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 ring-1 ring-teal-600"
                : "bg-surface border border-edge text-muted hover:text-heading hover:bg-surface-hover"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Tasks grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredActions.map((action) => {
          const isDisabled = !canWrite && action.badge !== "Read Data";
          return (
            <button
              key={action.label}
              type="button"
              disabled={isDisabled}
              aria-label={isDisabled ? `${action.label} (Disabled: viewer role cannot draft records)` : action.label}
              onClick={() => onSelect(action)}
              className={`group flex items-start gap-3 w-full p-3 rounded-xl bg-surface border transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] min-h-[44px] ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed border-edge"
                  : "border-edge hover:bg-surface-secondary hover:border-edge-hover"
              }`}
            >
              <div className="p-2 rounded-lg bg-surface-secondary text-muted group-hover:text-heading border border-edge-subtle flex-shrink-0 transition-colors">
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-xs font-semibold text-heading truncate">
                    {action.label}
                  </p>
                </div>
                <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                  {action.description}
                </p>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                      action.badge === "Draft - Requires Approval"
                        ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                        : action.badge === "Draft"
                          ? "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                          : "bg-surface-secondary text-muted border-edge"
                    }`}
                  >
                    {action.badge}
                  </span>
                  {action.needsFile && (
                    <span className="text-[9px] font-semibold text-muted px-1 rounded border border-edge">
                      File required
                    </span>
                  )}
                  {isDisabled && (
                    <span className="text-[9px] font-medium text-muted px-1 rounded border border-edge">
                      Requires Edit Role
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
