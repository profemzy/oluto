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
  const { user, loading: authLoading, timezone, role } = useAuth();
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
    <div className="min-h-full">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Welcome & Context Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-edge pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-heading">Financial Overview</h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Welcome back{user?.full_name ? `, ${user.full_name}` : ""}. Here is your business cash position and operating health.
            </p>
          </div>
          <div className="text-xs text-muted font-mono self-start sm:self-auto">
            Timezone: {timezone}
          </div>
        </div>

        <ErrorAlert error={error} className="mb-6" />

        <DashboardStats summary={summary} hasTransactions={!!hasTransactions} />

        {hasTransactions && summary && (
          <>
            <OutstandingSummary summary={summary} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 cols wide on desktop) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CashflowBreakdown summary={summary} />
                  <TransactionStatus summary={summary} />
                </div>

                <ExceptionsInbox 
                  summary={summary} 
                  overdueInvoices={overdueInvoices} 
                  overdueBills={overdueBills} 
                />
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                <QuickActions />

                {summary && (
                  <RecentActivity transactions={summary.recent_transactions} />
                )}

                {arAging && <ARAging arAging={arAging} />}

                {reconSummary && <ReconciliationStatus reconSummary={reconSummary} />}

                {user && <UserInfoCard user={user} role={role} />}
              </div>
            </div>
          </>
        )}

        {!hasTransactions && <EmptyState />}
      </div>
    </div>
  );
}
