"use client";

import Link from "next/link";
import { useState } from "react";
import { api, TrialBalance } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

export default function TrialBalancePage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);
  const [report, setReport] = useState<TrialBalance | null>(null);

  const generate = async () => {
    if (!user?.business_id) return;
    setError("");
    setLoading(true);
    try {
      const data = await api.getTrialBalance(user.business_id!, asOfDate);
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
        title="Trial Balance"
        subtitle={report ? `As of ${report.as_of_date}` : "Verify debits equal credits"}
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

        <div className="flex items-end gap-4 mb-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">As of Date</label>
            <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)}
              className="rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm" />
          </div>
          <button onClick={generate} disabled={loading}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50">
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {report && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b flex justify-between items-center">
              <div className="grid grid-cols-5 gap-4 flex-1 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div>Code</div>
                <div className="col-span-2">Account Name</div>
                <div className="text-right">Debit</div>
                <div className="text-right">Credit</div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {report.entries.map((entry) => (
                <div key={entry.account_id} className="grid grid-cols-5 gap-4 px-6 py-3 hover:bg-cyan-50/50 transition-all">
                  <div className="text-sm font-mono text-gray-600">{entry.code}</div>
                  <div className="col-span-2 text-sm text-gray-900">{entry.name}</div>
                  <div className="text-sm text-right">{parseFloat(entry.debit_balance) > 0 ? formatCurrency(entry.debit_balance) : ""}</div>
                  <div className="text-sm text-right">{parseFloat(entry.credit_balance) > 0 ? formatCurrency(entry.credit_balance) : ""}</div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t grid grid-cols-5 gap-4">
              <div className="col-span-3 text-sm font-bold text-gray-900">Total</div>
              <div className="text-sm font-bold text-right">{formatCurrency(report.total_debits)}</div>
              <div className="text-sm font-bold text-right">{formatCurrency(report.total_credits)}</div>
            </div>
            <div className="px-6 py-3 border-t">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${report.is_balanced ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {report.is_balanced ? "Balanced" : "NOT Balanced"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
