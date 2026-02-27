"use client";

import { useState } from "react";
import { api, AccountsReceivableAging, computeAgingTotals } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";
import { ReportPageLayout, useReportDates } from "@/app/reports/components/ReportPageLayout";

export default function ArAgingPage() {
  const { asOfDate, setAsOfDate } = useReportDates("single");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<AccountsReceivableAging | null>(null);

  const onGenerate = async (businessId: string) => {
    setError("");
    setLoading(true);
    try {
      setReport(await api.getArAging(businessId, asOfDate));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportPageLayout
      title="AR Aging"
      subtitle="Accounts receivable aging analysis"
      reportSubtitle={report ? `As of ${report.as_of_date}` : undefined}
      dateMode="single"
      loading={loading}
      error={error}
      onGenerate={onGenerate}
      dateFields={[{ label: "As of Date", value: asOfDate, onChange: setAsOfDate }]}
    >
      {() =>
        report ? (
          <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-edge">
                <thead className="bg-gradient-to-r from-surface-secondary to-surface-tertiary">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-muted uppercase tracking-wider">Current</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-muted uppercase tracking-wider">1-30</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-muted uppercase tracking-wider">31-60</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-muted uppercase tracking-wider">61-90</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-muted uppercase tracking-wider">90+</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-muted uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge-subtle">
                  {report.buckets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">No outstanding receivables</td>
                    </tr>
                  ) : (
                    report.buckets.map((b) => (
                      <tr key={b.customer_id} className="hover:bg-cyan-50/50 dark:hover:bg-cyan-950/50 transition-all">
                        <td className="px-4 py-3 text-sm font-bold text-heading">{b.customer_name}</td>
                        <td className="px-4 py-3 text-sm text-right">{parseFloat(b.current) > 0 ? formatCurrency(b.current) : ""}</td>
                        <td className="px-4 py-3 text-sm text-right">{parseFloat(b.days_1_30) > 0 ? formatCurrency(b.days_1_30) : ""}</td>
                        <td className="px-4 py-3 text-sm text-right">{parseFloat(b.days_31_60) > 0 ? formatCurrency(b.days_31_60) : ""}</td>
                        <td className="px-4 py-3 text-sm text-right">{parseFloat(b.days_61_90) > 0 ? formatCurrency(b.days_61_90) : ""}</td>
                        <td className="px-4 py-3 text-sm text-right text-red-600 font-bold">{parseFloat(b.days_91_plus) > 0 ? formatCurrency(b.days_91_plus) : ""}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">{formatCurrency(b.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {report.buckets.length > 0 && (() => {
                  const totals = computeAgingTotals(report);
                  return (
                    <tfoot className="bg-gradient-to-r from-surface-secondary to-surface-tertiary border-t">
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold text-heading">Total</td>
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
        ) : null
      }
    </ReportPageLayout>
  );
}
