"use client";

import Link from "next/link";
import { useState } from "react";
import { api, BalanceSheet } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

export default function BalanceSheetPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);
  const [report, setReport] = useState<BalanceSheet | null>(null);

  const generate = async () => {
    if (!user?.business_id) return;
    setError("");
    setLoading(true);
    try {
      const data = await api.getBalanceSheet(user.business_id!, asOfDate);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <PageLoader />;

  const Section = ({ title, accounts, total, colorClass }: {
    title: string;
    accounts: { account_id: string; name: string; net_balance: string }[];
    total: string;
    colorClass: string;
  }) => (
    <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
      <div className={`px-6 py-4 border-b ${colorClass}`}>
        <h3 className="text-sm font-bold uppercase tracking-wider">{title}</h3>
      </div>
      <div className="divide-y divide-edge-subtle">
        {accounts.length === 0 ? (
          <div className="px-6 py-4 text-sm text-muted">No accounts</div>
        ) : (
          accounts.map((a) => (
            <div key={a.account_id} className="flex justify-between px-6 py-3">
              <span className="text-sm text-heading">{a.name}</span>
              <span className="text-sm font-bold text-body">{formatCurrency(a.net_balance)}</span>
            </div>
          ))
        )}
      </div>
      <div className="px-6 py-3 bg-surface-secondary border-t flex justify-between">
        <span className="text-sm font-bold text-heading">Total {title}</span>
        <span className="text-sm font-bold text-heading">{formatCurrency(total)}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-secondary relative">
      <PageHeader
        title="Balance Sheet"
        subtitle={report ? `As of ${report.as_of_date}` : "Assets = Liabilities + Equity"}
        actions={
          <Link href="/reports" className="group inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2 text-sm font-bold text-body shadow-sm hover:bg-surface-hover transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Reports
          </Link>
        }
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />

        <div className="flex items-end gap-4 mb-8">
          <div>
            <label className="block text-sm font-bold text-body mb-1">As of Date</label>
            <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)}
              className="rounded-xl border-0 py-2.5 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm" />
          </div>
          <button onClick={generate} disabled={loading}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50">
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {report && (
          <div className="space-y-6">
            <Section title="Assets" accounts={report.assets.accounts} total={report.assets.total} colorClass="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800" />
            <Section title="Liabilities" accounts={report.liabilities.accounts} total={report.liabilities.total} colorClass="bg-gradient-to-r from-red-50 to-orange-50 text-red-800" />
            <Section title="Equity" accounts={report.equity.accounts} total={report.equity.total} colorClass="bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800" />

            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-6 flex justify-between items-center">
              <span className="text-lg font-bold text-heading">Accounting Equation</span>
              <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold ${report.is_balanced ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700" : "bg-red-50 dark:bg-red-950 text-red-700"}`}>
                {report.is_balanced ? "Balanced" : "NOT Balanced"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
