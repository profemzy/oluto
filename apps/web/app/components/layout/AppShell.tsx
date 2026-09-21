"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useAuthContext } from "@/app/components/AuthProvider";
import { ThemeToggle } from "@/app/components/ThemeToggle";

interface NavItem {
  name: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
  badge?: string;
  writeOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// Crisp financial icons
const Icons = {
  Dashboard: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  Briefing: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  Agent: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 19.5z" />
    </svg>
  ),
  Transactions: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  ),
  Invoices: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  Payments: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6H2.25m0 0v10.5m0-10.5h19.5m0 0v10.5m0 0v.75a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75V16.5m19.5 0H2.25" />
    </svg>
  ),
  Bills: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 14.25l6-6m4.5-3.75L3 20.25m10.5-6.75L18 9m-4.5 5.25l-4.5 4.5" />
    </svg>
  ),
  Contacts: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Accounts: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  Reconciliation: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Reports: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125-1.125V4.125z" />
    </svg>
  ),
  Team: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  Settings: (active: boolean) => (
    <svg className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.869a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const navigationGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Icons.Dashboard },
      { name: "Daily Briefing", href: "/daily-briefings", icon: Icons.Briefing },
      { name: "Agent Operations", href: "/chat", icon: Icons.Agent, badge: "Live" },
      { name: "Transactions", href: "/transactions", icon: Icons.Transactions },
    ],
  },
  {
    title: "Money In",
    items: [
      { name: "Invoices", href: "/invoices", icon: Icons.Invoices },
      { name: "Payments Received", href: "/payments", icon: Icons.Payments },
      { name: "Customers", href: "/contacts", icon: Icons.Contacts },
    ],
  },
  {
    title: "Money Out",
    items: [
      { name: "Bills", href: "/bills", icon: Icons.Bills },
      { name: "Vendors", href: "/contacts?filter=vendors", icon: Icons.Contacts },
    ],
  },
  {
    title: "Accounting",
    items: [
      { name: "Chart of Accounts", href: "/accounts", icon: Icons.Accounts },
      { name: "Reconciliation", href: "/reconciliation", icon: Icons.Reconciliation },
      { name: "Financial Reports", href: "/reports", icon: Icons.Reports },
    ],
  },
  {
    title: "Administration",
    items: [
      { name: "Team & Access", href: "/settings/team", icon: Icons.Team },
      { name: "Settings", href: "/settings", icon: Icons.Settings },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, canWrite, loading } = useAuth({ requireBusiness: false });
  const { logout } = useAuthContext();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Role display formatting
  const roleDisplay = useMemo(() => {
    switch (role) {
      case "owner":
        return { label: "Owner", color: "bg-emerald-950 text-emerald-300 border-emerald-800" };
      case "administrator":
      case "admin":
        return { label: "Admin", color: "bg-blue-950 text-blue-300 border-blue-800" };
      case "accountant":
        return { label: "Accountant", color: "bg-teal-950 text-teal-300 border-teal-800" };
      default:
        return { label: "Viewer", color: "bg-slate-800 text-slate-300 border-slate-700" };
    }
  }, [role]);

  // Derive section title from pathname
  const currentTitle = useMemo(() => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/daily-briefings")) return "Daily Briefing";
    if (pathname.startsWith("/chat")) return "Agent Operations";
    if (pathname.startsWith("/transactions")) return "Transactions";
    if (pathname.startsWith("/invoices")) return "Invoices";
    if (pathname.startsWith("/bills")) return "Bills";
    if (pathname.startsWith("/payments")) return "Payments";
    if (pathname.startsWith("/contacts")) return "Contacts";
    if (pathname.startsWith("/accounts")) return "Chart of Accounts";
    if (pathname.startsWith("/reconciliation")) return "Bank Reconciliation";
    if (pathname.startsWith("/reports")) return "Financial Reports";
    if (pathname.startsWith("/settings")) return "Settings";
    if (pathname.startsWith("/onboarding")) return "Setup";
    return "Oluto Finance";
  }, [pathname]);

  const renderNavLinks = (onNavigate?: () => void) => (
    <div className="space-y-6 py-2">
      {navigationGroups.map((group) => (
        <div key={group.title}>
          <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {group.title}
          </div>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    active
                      ? "bg-[#162738] text-white border-l-2 border-teal-400"
                      : "text-slate-300 hover:bg-[#121f2d] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.icon(active)}
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-teal-900/60 text-teal-300 border border-teal-700/50">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F7F4] dark:bg-[#0B1825] flex flex-col lg:flex-row antialiased">
      {/* =========================================================================
          DESKTOP PERSISTENT SIDEBAR (>= 1024px)
          Deep Navy #0B1825 institutional tone, 1px border right #1E2C3A
          ========================================================================= */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col bg-[#0B1825] border-r border-[#1E2C3A] min-h-screen z-40 sticky top-0 h-screen">
        {/* Top brand header */}
        <div className="p-4 border-b border-[#1E2C3A]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#087E78] flex items-center justify-center text-white font-bold shadow-sm">
              <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                <path d="M12 24L24 12M24 12H16M24 12V20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">Oluto</span>
              <span className="block text-[10px] font-medium text-slate-400">Financial OS</span>
            </div>
          </Link>

          {/* Business & Role Badge */}
          <div className="mt-3 p-2 rounded bg-[#121F2D] border border-[#1E2C3A] flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-semibold text-slate-200 truncate">
                Oluto Demo Business
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                CAD &middot; Canada
              </p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${roleDisplay.color}`}>
              {roleDisplay.label}
            </span>
          </div>
        </div>

        {/* Scrollable Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {renderNavLinks()}
        </div>

        {/* Bottom User & Session Controls */}
        <div className="p-3 border-t border-[#1E2C3A] bg-[#08131E]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold uppercase">
                {user?.full_name ? user.full_name.charAt(0) : "O"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.full_name || "User"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || "oluto@oluto.ca"}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full text-center py-1.5 px-2 rounded text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* =========================================================================
          APPLICATION MAIN WORKSPACE
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Contextual App Header */}
        <header className="sticky top-0 z-30 h-14 bg-surface border-b border-edge flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile drawer toggle */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-muted hover:text-heading hover:bg-surface-hover"
              aria-label="Open Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted hidden sm:inline">Operating Environment</span>
              <span className="text-xs text-muted hidden sm:inline">/</span>
              <h1 className="text-sm font-bold text-heading">{currentTitle}</h1>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Read-only notification for viewers */}
            {!canWrite && !loading && (
              <span className="status-badge status-badge-warning text-[11px]">
                Viewer (Read-Only)
              </span>
            )}

            {/* Quick action button gated by write permission */}
            {canWrite && (
              <Link
                href="/transactions/new"
                className="btn-primary text-xs py-1.5 px-3"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Transaction</span>
              </Link>
            )}

            <Link
              href="/chat"
              className="p-1.5 rounded-md text-muted hover:text-heading hover:bg-surface-hover transition-colors"
              title="Agent Console"
              aria-label="Agent Console"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 19.5z" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main id="main-content" className="flex-1 pb-16 lg:pb-0" tabIndex={-1}>
          {children}
        </main>
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OUT DRAWER (< 1024px)
          ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Slide-out sheet */}
          <div className="fixed inset-y-0 left-0 w-72 bg-[#0B1825] border-r border-[#1E2C3A] flex flex-col z-50 shadow-xl">
            <div className="p-4 border-b border-[#1E2C3A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-[#087E78] flex items-center justify-center text-white font-bold">
                  <svg width="18" height="18" viewBox="0 0 36 36" fill="none">
                    <path d="M12 24L24 12M24 12H16M24 12V20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-white">Oluto Finance</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
              {renderNavLinks(() => setMobileDrawerOpen(false))}
            </div>

            <div className="p-3 border-t border-[#1E2C3A] bg-[#08131E]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-300 font-medium">{user?.full_name || "User"}</span>
                <ThemeToggle />
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  logout();
                }}
                className="w-full text-center py-1.5 px-2 rounded text-xs font-medium text-slate-400 hover:text-rose-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION (< 1024px)
          High-frequency quick navigation
          ========================================================================= */}
      <nav
        aria-label="Mobile primary navigation"
        className="fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-edge flex lg:hidden items-center justify-around h-14 px-2"
      >
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold ${
            pathname.startsWith("/dashboard") ? "text-[#087E78]" : "text-muted hover:text-heading"
          }`}
        >
          {Icons.Dashboard(pathname.startsWith("/dashboard"))}
          <span className="mt-0.5">Overview</span>
        </Link>

        <Link
          href="/transactions"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold ${
            pathname.startsWith("/transactions") ? "text-[#087E78]" : "text-muted hover:text-heading"
          }`}
        >
          {Icons.Transactions(pathname.startsWith("/transactions"))}
          <span className="mt-0.5">Ledger</span>
        </Link>

        <Link
          href="/invoices"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold ${
            pathname.startsWith("/invoices") ? "text-[#087E78]" : "text-muted hover:text-heading"
          }`}
        >
          {Icons.Invoices(pathname.startsWith("/invoices"))}
          <span className="mt-0.5">Invoices</span>
        </Link>

        <Link
          href="/chat"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold ${
            pathname.startsWith("/chat") ? "text-[#087E78]" : "text-muted hover:text-heading"
          }`}
        >
          {Icons.Agent(pathname.startsWith("/chat"))}
          <span className="mt-0.5">Agent</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold text-muted hover:text-heading"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span className="mt-0.5">Menu</span>
        </button>
      </nav>
    </div>
  );
}
