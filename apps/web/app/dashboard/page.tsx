"use client";

import { useEffect, useState } from "react";
import { api, DashboardSummary, Invoice, Bill, AccountsReceivableAging, ReconciliationSummary, computeAgingTotals } from "@/app/lib/api";
import { formatCurrency, todayInTimezone } from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { DashboardSkeleton, PageHeader, ErrorAlert } from "@/app/components";
import {
  DashboardStats,
  OutstandingSummary,
  EmptyState,
  CashflowBreakdown,
  TransactionStatus,
  ExceptionsInbox,
  RecentActivity,
  ARAging,
  ReconciliationStatus,
  QuickActions,
  UserInfoCard,
} from "./components";

export default function DashboardPage() {
  const { user, loading: authLoading, timezone } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [overdueBills, setOverdueBills] = useState<Bill[]>([]);
  const [arAging, setArAging] = useState<AccountsReceivableAging | null>(null);
  const [reconSummary, setReconSummary] = useState<ReconciliationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    Promise.allSettled([
      api.getDashboardSummary(user.business_id!),
      api.getOverdueInvoices(user.business_id!),
      api.getOverdueBills(user.business_id!),
      api.getArAging(user.business_id!, todayInTimezone(timezone)),
      api.getReconciliationSummary(user.business_id!),
    ])
      .then(([summaryResult, invsResult, billsResult, agingResult, reconResult]) => {
        if (summaryResult.status === "fulfilled") {
          setSummary(summaryResult.value);
        } else {
          setError("Failed to load dashboard summary");
        }
        setOverdueInvoices(invsResult.status === "fulfilled" ? invsResult.value : []);
        setOverdueBills(billsResult.status === "fulfilled" ? billsResult.value : []);
        setArAging(agingResult.status === "fulfilled" ? agingResult.value : null);
        setReconSummary(reconResult.status === "fulfilled" ? reconResult.value : null);
      })
      .finally(() => setLoading(false));
  }, [user, timezone]);

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  const hasTransactions = summary && summary.transactions_count > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      {/* Decorative Background Dots with animations */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-cyan-200 dark:bg-cyan-800 rounded-full opacity-30 blur-2xl animate-bounce-subtle" />
      <div className="absolute top-40 left-20 w-32 h-32 bg-green-200 dark:bg-green-800 rounded-full opacity-30 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-teal-200 dark:bg-teal-800 rounded-full opacity-25 blur-2xl animate-float-slow" />
      <div className="absolute top-1/3 left-[5%] w-16 h-16 bg-cyan-100 rounded-full opacity-40 blur-xl animate-bounce-gentle" />

      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back${user?.full_name ? `, ${user.full_name}` : ""}!`}
      />

      {/* Dashboard Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />

        <DashboardStats summary={summary} hasTransactions={!!hasTransactions} />

        {hasTransactions && summary && (
          <>
            <OutstandingSummary summary={summary} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Top row: Cashflow + Status side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <CashflowBreakdown summary={summary} />
                  <TransactionStatus summary={summary} />
                </div>

                {/* Exceptions Inbox */}
                <ExceptionsInbox 
                  summary={summary} 
                  overdueInvoices={overdueInvoices} 
                  overdueBills={overdueBills} 
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {user && <UserInfoCard user={user} />}
                
                {summary && (
                  <RecentActivity transactions={summary.recent_transactions} />
                )}

                {arAging && <ARAging arAging={arAging} />}

                {reconSummary && <ReconciliationStatus reconSummary={reconSummary} />}

                <QuickActions />
              </div>
            </div>
          </>
        )}

        {!hasTransactions && <EmptyState />}
      </div>
    </div>
  );
}
