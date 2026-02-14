"use client";

import Link from "next/link";
import { useState } from "react";
import { api, ProfitLossStatement } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

export default function ProfitLossPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [startDate, setStartDate] = useState(firstOfYear);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState<ProfitLossStatement | null>(null);

  const generate = async () => {
    if (!user?.business_id) return;
    setError("");
    setLoading(true);
    try {
      const data = await api.getProfitLoss(user.business_id!, startDate, endDate);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <PageHeader
        title="Profit & Loss"
        subtitle={report ? `${report.start_date} to ${report.end_date}` : "Revenue vs expenses"}
        actions={
          <Link href="/reports" className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Reports
          </Link>
        }
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />

        <div className="flex flex-wrap items-end gap-4 mb-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm" />
          </div>
          <button onClick={generate} disabled={loading}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50">
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {report && (
          <div className="space-y-6">
            {/* Revenue */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Revenue</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {report.revenue.accounts.map((a) => (
                  <div key={a.account_id} className="flex justify-between px-6 py-3">
                    <span className="text-sm text-gray-900">{a.name}</span>
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(a.net_balance)}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-emerald-50/50 border-t flex justify-between">
                <span className="text-sm font-bold text-gray-900">Total Revenue</span>
                <span className="text-sm font-bold text-emerald-700">{formatCurrency(report.revenue.total)}</span>
              </div>
            </div>

            {/* Expenses */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider">Expenses</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {report.expenses.accounts.map((a) => (
                  <div key={a.account_id} className="flex justify-between px-6 py-3">
                    <span className="text-sm text-gray-900">{a.name}</span>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(a.net_balance)}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-red-50/50 border-t flex justify-between">
                <span className="text-sm font-bold text-gray-900">Total Expenses</span>
                <span className="text-sm font-bold text-red-700">{formatCurrency(report.expenses.total)}</span>
              </div>
            </div>

            {/* Net Income */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Net Income</span>
              <span className={`text-2xl font-bold ${parseFloat(report.net_income) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(report.net_income)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
