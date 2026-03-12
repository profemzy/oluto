"use client";

import { useState } from "react";
import { api, ProfitLossStatement } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";
import { ReportPageLayout, useReportDates } from "@/app/reports/components/ReportPageLayout";

export default function ProfitLossPage() {
  const { startDate, setStartDate, endDate, setEndDate } = useReportDates("range");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ProfitLossStatement | null>(null);

  const dateError = startDate && endDate && startDate > endDate ? "Start date must be before end date" : "";

  const onGenerate = async (businessId: string) => {
    if (dateError) return;
    setError("");
    setLoading(true);
    try {
      setReport(await api.getProfitLoss(businessId, startDate, endDate));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportPageLayout
      title="Profit & Loss"
      subtitle="Revenue vs expenses"
      reportSubtitle={report ? `${report.period_start} to ${report.period_end}` : undefined}
      dateMode="range"
      loading={loading}
      error={error}
      onGenerate={onGenerate}
      dateError={dateError}
      dateFields={[
        { label: "Start Date", value: startDate, onChange: setStartDate },
        { label: "End Date", value: endDate, onChange: setEndDate },
      ]}
    >
      {() =>
        report ? (
          <div className="space-y-6">
            {/* Revenue */}
            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-b">
                <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Revenue</h3>
              </div>
              <div className="divide-y divide-edge-subtle">
                {(report.revenue_entries || []).length === 0 ? (
                  <div className="px-6 py-4 text-sm text-muted">No revenue entries</div>
                ) : (
                  (report.revenue_entries || []).map((a) => (
                    <div key={a.account_id} className="flex justify-between px-6 py-3">
                      <span className="text-sm text-heading">{a.account_name}</span>
                      <span className="text-sm font-bold text-emerald-600">{formatCurrency(a.amount)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="px-6 py-3 bg-emerald-50/50 dark:bg-emerald-950/50 border-t flex justify-between">
                <span className="text-sm font-bold text-heading">Total Revenue</span>
                <span className="text-sm font-bold text-emerald-700">{formatCurrency(report.total_revenue || "0")}</span>
              </div>
            </div>

            {/* Expenses */}
            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-b">
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">Expenses</h3>
              </div>
              <div className="divide-y divide-edge-subtle">
                {(report.expense_entries || []).length === 0 ? (
                  <div className="px-6 py-4 text-sm text-muted">No expense entries</div>
                ) : (
                  (report.expense_entries || []).map((a) => (
                    <div key={a.account_id} className="flex justify-between px-6 py-3">
                      <span className="text-sm text-heading">{a.account_name}</span>
                      <span className="text-sm font-bold text-red-600">{formatCurrency(a.amount)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="px-6 py-3 bg-red-50/50 dark:bg-red-950/50 border-t flex justify-between">
                <span className="text-sm font-bold text-heading">Total Expenses</span>
                <span className="text-sm font-bold text-red-700">{formatCurrency(report.total_expenses || "0")}</span>
              </div>
            </div>

            {/* Net Income */}
            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-6 flex justify-between items-center">
              <span className="text-lg font-bold text-heading">Net Income</span>
              <span className={`text-2xl font-bold ${parseFloat(report.net_income) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(report.net_income)}
              </span>
            </div>
          </div>
        ) : null
      }
    </ReportPageLayout>
  );
}
