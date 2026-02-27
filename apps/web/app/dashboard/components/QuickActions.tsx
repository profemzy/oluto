"use client";

import Link from "next/link";

interface QuickAction {
  href: string;
  label: string;
  gradient: string;
  hoverBorder: string;
  hoverBg: string;
  hoverText: string;
  hoverShadow: string;
  hoverChevron: string;
  icon: string;
}

const quickActions: QuickAction[] = [
  { 
    href: "/invoices/new", 
    label: "Create Invoice", 
    gradient: "from-blue-500 to-indigo-500", 
    hoverBorder: "hover:border-blue-400", 
    hoverBg: "hover:from-blue-50 hover:to-indigo-50", 
    hoverText: "group-hover:text-blue-700", 
    hoverShadow: "group-hover:shadow-blue-500/30", 
    hoverChevron: "group-hover:text-blue-500", 
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
  },
  { 
    href: "/payments/new", 
    label: "Record Payment", 
    gradient: "from-green-500 to-emerald-500", 
    hoverBorder: "hover:border-green-400", 
    hoverBg: "hover:from-green-50 hover:to-emerald-50", 
    hoverText: "group-hover:text-green-700", 
    hoverShadow: "group-hover:shadow-green-500/30", 
    hoverChevron: "group-hover:text-green-500", 
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" 
  },
  { 
    href: "/bills/new", 
    label: "Create Bill", 
    gradient: "from-amber-500 to-orange-500", 
    hoverBorder: "hover:border-amber-400", 
    hoverBg: "hover:from-amber-50 hover:to-orange-50", 
    hoverText: "group-hover:text-amber-700", 
    hoverShadow: "group-hover:shadow-amber-500/30", 
    hoverChevron: "group-hover:text-amber-500", 
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
  },
  { 
    href: "/transactions/new", 
    label: "Add Transaction", 
    gradient: "from-cyan-500 to-teal-500", 
    hoverBorder: "hover:border-cyan-400", 
    hoverBg: "hover:from-cyan-50 hover:to-teal-50", 
    hoverText: "group-hover:text-cyan-700", 
    hoverShadow: "group-hover:shadow-cyan-500/30", 
    hoverChevron: "group-hover:text-cyan-500", 
    icon: "M12 4v16m8-8H4" 
  },
  { 
    href: "/reports", 
    label: "View Reports", 
    gradient: "from-purple-500 to-violet-500", 
    hoverBorder: "hover:border-purple-400", 
    hoverBg: "hover:from-purple-50 hover:to-violet-50", 
    hoverText: "group-hover:text-purple-700", 
    hoverShadow: "group-hover:shadow-purple-500/30", 
    hoverChevron: "group-hover:text-purple-500", 
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
  },
];

export function QuickActions() {
  return (
    <div className="bg-surface rounded-2xl border border-edge-subtle shadow-lg p-6">
      <h2 className="text-lg font-bold text-heading mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`group flex items-center gap-3 p-3 rounded-xl border-2 border-edge ${action.hoverBorder} hover:bg-gradient-to-r ${action.hoverBg} transition-all duration-300`}
          >
            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm ${action.hoverShadow}`}>
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
            </div>
            <span className={`text-sm font-bold text-body ${action.hoverText}`}>{action.label}</span>
            <svg className={`w-4 h-4 text-caption ml-auto ${action.hoverChevron} group-hover:translate-x-1 transition-all`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
