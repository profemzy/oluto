"use client";

import Link from "next/link";
import { useState } from "react";
import { api, AccountsReceivableAging, computeAgingTotals } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

export default function ArAgingPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);
  const [report, setReport] = useState<AccountsReceivableAging | null>(null);

  const generate = async () => {
    if (!user?.business_id) return;
    setError("");
    setLoading(true);
    try {
      const data = await api.getArAging(user.business_id!, asOfDate);
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
        title="AR Aging"
        subtitle={report ? `As of ${report.as_of_date}` : "Accounts receivable aging analysis"}
        actions={
          <Link href="/reports" className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Reports
          </Link>
        }
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Current</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">1-30</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">31-60</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">61-90</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">90+</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.buckets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No outstanding receivables</td>
                    </tr>
                  ) : (
                    report.buckets.map((b) => (
                      <tr key={b.customer_id} className="hover:bg-cyan-50/50 transition-all">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{b.customer_name}</td>
                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(b.current)}</td>
                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(b.days_1_30)}</td>
                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(b.days_31_60)}</td>
                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(b.days_61_90)}</td>
                        <td className="px-4 py-3 text-sm text-right text-red-600 font-bold">{formatCurrency(b.days_91_plus)}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">{formatCurrency(b.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {report.buckets.length > 0 && (() => {
                  const totals = computeAgingTotals(report);
                  return (
                  <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100 border-t">
                    <tr>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                      <td className="px-4 py-3 text-sm text-right font-bold">{formatCurrency(totals.current)}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold">{formatCurrency(totals.days_1_30)}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold">{formatCurrency(totals.days_31_60)}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold">{formatCurrency(totals.days_61_90)}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-red-600">{formatCurrency(totals.days_91_plus)}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold">{formatCurrency(totals.total)}</td>
                    </tr>
                  </tfoot>
                  );
                })()}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
