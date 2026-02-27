"use client";

import { useState } from "react";

export interface QuickAction {
  label: string;
  prompt: string;
  description: string;
  category: "insights" | "money-out" | "money-in" | "growth";
  icon: React.ReactNode;
  needsFile?: boolean;
}

// Icons
const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TaxIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export const QUICK_ACTIONS: QuickAction[] = [
  // Insights (cyan)
  { label: "Daily Briefing", description: "Morning financial summary", prompt: "Give me today's daily briefing", category: "insights", icon: <BellIcon /> },
  { label: "Cash Position", description: "Safe to spend amount", prompt: "What is my current cash position?", category: "insights", icon: <WalletIcon /> },
  { label: "Overdue Invoices", description: "What needs follow-up", prompt: "Show me overdue invoices", category: "insights", icon: <FileTextIcon /> },
  { label: "Expense Summary", description: "This month's spending", prompt: "Summarize my recent expenses", category: "insights", icon: <ChartIcon /> },
  // Money Out (amber)
  { label: "Upload Receipt", description: "Snap & categorize", prompt: "I'd like to upload a receipt", category: "money-out", icon: <CameraIcon />, needsFile: true },
  { label: "Log Expense", description: "Record a purchase", prompt: "Help me log an expense", category: "money-out", icon: <PlusCircleIcon /> },
  { label: "Import Statement", description: "CSV or PDF upload", prompt: "I want to import a bank statement", category: "money-out", icon: <UploadIcon />, needsFile: true },
  // Money In (emerald)
  { label: "Record Income", description: "Add revenue", prompt: "Record income for my business", category: "money-in", icon: <DollarIcon /> },
  { label: "Create Invoice", description: "Bill a customer", prompt: "Create an invoice for a customer", category: "money-in", icon: <BriefcaseIcon /> },
  // Growth (violet)
  { label: "P&L Report", description: "Profit & loss statement", prompt: "Generate a profit and loss report", category: "growth", icon: <TrendingUpIcon /> },
  { label: "Tax Summary", description: "CRA tax overview", prompt: "Show me my tax summary for CRA", category: "growth", icon: <TaxIcon /> },
];

const CATEGORY_LABELS: Record<string, string> = {
  "insights": "Insights",
  "money-out": "Money Out",
  "money-in": "Money In",
  "growth": "Growth",
};

const colorClasses: Record<string, { bg: string; border: string; text: string; hover: string; glow: string }> = {
  "insights": {
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    border: "border-cyan-200 dark:border-cyan-800/50",
    text: "text-cyan-600 dark:text-cyan-400",
    hover: "hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:border-cyan-300 dark:hover:border-cyan-700",
    glow: "group-hover:shadow-cyan-500/20",
  },
  "money-out": {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800/50",
    text: "text-amber-600 dark:text-amber-400",
    hover: "hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700",
    glow: "group-hover:shadow-amber-500/20",
  },
  "money-in": {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800/50",
    text: "text-emerald-600 dark:text-emerald-400",
    hover: "hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700",
    glow: "group-hover:shadow-emerald-500/20",
  },
  "growth": {
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-800/50",
    text: "text-violet-600 dark:text-violet-400",
    hover: "hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:border-violet-300 dark:hover:border-violet-700",
    glow: "group-hover:shadow-violet-500/20",
  },
};

const categoryPillColors: Record<string, string> = {
  "insights": "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30",
  "money-out": "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
  "money-in": "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  "growth": "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30",
};

interface QuickActionsProps {
  variant: "welcome" | "compact";
  onSelect: (action: QuickAction) => void;
}

export function QuickActions({ variant, onSelect }: QuickActionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = ["insights", "money-out", "money-in", "growth"] as const;

  const filteredActions = selectedCategory
    ? QUICK_ACTIONS.filter((a) => a.category === selectedCategory)
    : QUICK_ACTIONS;

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-2 p-2">
        {QUICK_ACTIONS.map((action) => {
          const colors = colorClasses[action.category];
          return (
            <button
              key={action.label}
              onClick={() => onSelect(action)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ${colors.bg} ${colors.border} border ${colors.hover} transition-all duration-200 hover:shadow-md ${colors.glow}`}
            >
              <span className={`${colors.text} group-hover:scale-110 transition-transform`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Welcome variant — full grid with category filters
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Category filter pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedCategory === null
              ? "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/30"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? `${categoryPillColors[cat]} ring-2 ring-opacity-30`
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredActions.map((action, index) => {
          const colors = colorClasses[action.category];
          return (
            <button
              key={action.label}
              onClick={() => onSelect(action)}
              className={`group flex items-center gap-3 w-full p-3 rounded-xl ${colors.bg} ${colors.border} border ${colors.hover} transition-all duration-200 hover:shadow-lg ${colors.glow} animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform duration-200`}>
                {action.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {action.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {action.description}
                </p>
              </div>
              {action.needsFile && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20 text-gray-500 dark:text-gray-400">
                  File
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
