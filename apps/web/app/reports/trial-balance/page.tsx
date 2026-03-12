"use client";

import { useState } from "react";
import { api, TrialBalance } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";
import { ReportPageLayout, useReportDates } from "@/app/reports/components/ReportPageLayout";

export default function TrialBalancePage() {
  const { asOfDate, setAsOfDate } = useReportDates("single");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<TrialBalance | null>(null);

  const onGenerate = async (businessId: string) => {
    setError("");
    setLoading(true);
    try {
      setReport(await api.getTrialBalance(businessId, asOfDate));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportPageLayout
      title="Trial Balance"
      subtitle="Verify debits equal credits"
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
            <div className="px-6 py-4 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b flex justify-between items-center">
              <div className="grid grid-cols-5 gap-4 flex-1 text-xs font-bold text-muted uppercase tracking-wider">
                <div>Code</div>
                <div className="col-span-2">Account Name</div>
                <div className="text-right">Debit</div>
                <div className="text-right">Credit</div>
              </div>
            </div>
            <div className="divide-y divide-edge-subtle">
              {(report.entries || []).length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-muted">No posted transactions found for this date.</div>
              ) : (
                (report.entries || []).map((entry) => (
                  <div key={entry.account_id} className="grid grid-cols-5 gap-4 px-6 py-3 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/50 transition-all">
                    <div className="text-sm font-mono text-body">{entry.account_code}</div>
                    <div className="col-span-2 text-sm text-heading">{entry.account_name}</div>
                    <div className="text-sm text-right">{parseFloat(entry.debit) > 0 ? formatCurrency(entry.debit) : ""}</div>
                    <div className="text-sm text-right">{parseFloat(entry.credit) > 0 ? formatCurrency(entry.credit) : ""}</div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-t grid grid-cols-5 gap-4">
              <div className="col-span-3 text-sm font-bold text-heading">Total</div>
              <div className="text-sm font-bold text-right">{formatCurrency(report.total_debits || "0")}</div>
              <div className="text-sm font-bold text-right">{formatCurrency(report.total_credits || "0")}</div>
            </div>
            <div className="px-6 py-3 border-t">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${report.is_balanced ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700" : "bg-red-50 dark:bg-red-950 text-red-700"}`}>
                {report.is_balanced ? "Balanced" : "NOT Balanced"}
              </span>
            </div>
          </div>
        ) : null
      }
    </ReportPageLayout>
  );
}
