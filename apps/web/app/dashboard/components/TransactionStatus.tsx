"use client";

import { DashboardSummary } from "@/app/lib/api";

interface TransactionStatusProps {
  summary: DashboardSummary;
}

interface StatusConfig {
  key: keyof DashboardSummary["status_counts"];
  label: string;
  color: string;
  dotColor: string;
}

const statusConfigs: StatusConfig[] = [
  { key: "posted", label: "Posted", color: "bg-emerald-500", dotColor: "bg-emerald-400" },
  { key: "ready", label: "Ready", color: "bg-cyan-500", dotColor: "bg-cyan-400" },
  { key: "draft", label: "Draft", color: "bg-gray-400", dotColor: "bg-gray-300" },
  { key: "processing", label: "Processing", color: "bg-blue-400", dotColor: "bg-blue-300" },
  { key: "inbox_user", label: "Needs Review", color: "bg-amber-400", dotColor: "bg-amber-300" },
  { key: "inbox_firm", label: "Firm Review", color: "bg-purple-400", dotColor: "bg-purple-300" },
];

export function TransactionStatus({ summary }: TransactionStatusProps) {
  const total = summary.transactions_count;

  return (
    <div className="group bg-surface rounded-2xl border border-edge-subtle shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="p-6 border-b border-edge-subtle">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-heading">Transaction Status</h2>
          <span className="inline-flex items-center rounded-full bg-surface-tertiary px-3 py-1 text-xs font-bold text-body">{total} total</span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {statusConfigs.map((s) => {
          const count = summary.status_counts[s.key];
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={s.key} className={count === 0 ? "opacity-40" : ""}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.dotColor}`} />
                  <span className="text-sm text-body">{s.label}</span>
                </div>
                <span className={`text-sm font-semibold ${count > 0 ? "text-heading" : "text-caption"}`}>
                  {count}
                </span>
              </div>
              <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${s.color}`}
                  style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
