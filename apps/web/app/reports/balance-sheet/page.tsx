"use client";

import { useState } from "react";
import { api, BalanceSheet, BalanceSheetEntry } from "@/app/lib/api";
import { formatCurrency } from "@/app/lib/format";
import { ReportPageLayout, useReportDates } from "@/app/reports/components/ReportPageLayout";

function Section({ title, entries, total, colorClass }: {
  title: string;
  entries: BalanceSheetEntry[];
  total: string;
  colorClass: string;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
      <div className={`px-6 py-4 border-b ${colorClass}`}>
        <h3 className="text-sm font-bold uppercase tracking-wider">{title}</h3>
      </div>
      <div className="divide-y divide-edge-subtle">
        {entries.length === 0 ? (
          <div className="px-6 py-4 text-sm text-muted">No accounts</div>
        ) : (
          entries.map((a) => (
            <div key={a.account_id} className="flex justify-between px-6 py-3">
              <span className="text-sm text-heading">{a.account_name}</span>
              <span className="text-sm font-bold text-body">{formatCurrency(a.amount)}</span>
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
}

export default function BalanceSheetPage() {
  const { asOfDate, setAsOfDate } = useReportDates("single");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<BalanceSheet | null>(null);

  const onGenerate = async (businessId: string) => {
    setError("");
    setLoading(true);
    try {
      setReport(await api.getBalanceSheet(businessId, asOfDate));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  // Check balance: Assets = Liabilities + Equity
  const isBalanced = report
    ? Math.abs(parseFloat(report.total_assets) - parseFloat(report.total_liabilities) - parseFloat(report.total_equity)) < 0.01
    : true;

  return (
    <ReportPageLayout
      title="Balance Sheet"
      subtitle="Assets = Liabilities + Equity"
      reportSubtitle={report ? `As of ${report.as_of_date}` : undefined}
      dateMode="single"
      loading={loading}
      error={error}
      onGenerate={onGenerate}
      dateFields={[{ label: "As of Date", value: asOfDate, onChange: setAsOfDate }]}
    >
      {() =>
        report ? (
          <div className="space-y-6">
            <Section title="Assets" entries={report.asset_entries || []} total={report.total_assets || "0"} colorClass="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 text-emerald-800 dark:text-emerald-300" />
            <Section title="Liabilities" entries={report.liability_entries || []} total={report.total_liabilities || "0"} colorClass="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 text-red-800 dark:text-red-300" />
            <Section title="Equity" entries={report.equity_entries || []} total={report.total_equity || "0"} colorClass="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 text-blue-800 dark:text-blue-300" />

            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-6 flex justify-between items-center">
              <span className="text-lg font-bold text-heading">Accounting Equation</span>
              <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold ${isBalanced ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700" : "bg-red-50 dark:bg-red-950 text-red-700"}`}>
                {isBalanced ? "Balanced" : "NOT Balanced"}
              </span>
            </div>
          </div>
        ) : null
      }
    </ReportPageLayout>
  );
}
