"use client";

import Link from "next/link";
import { useState, ReactNode } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";
import { todayInTimezone, firstOfYearInTimezone } from "@/app/lib/format";

interface DateField {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

interface ReportPageLayoutProps {
  title: string;
  subtitle: string;
  reportSubtitle?: string;
  dateMode: "single" | "range";
  children: (props: { generate: () => void }) => ReactNode;
  onGenerate: (businessId: string) => Promise<void>;
  loading: boolean;
  error: string;
  dateFields: DateField[];
  dateError?: string;
}

export function useReportDates(mode: "single" | "range") {
  const { user, loading: authLoading, timezone } = useAuth();
  const [asOfDate, setAsOfDate] = useState(() => todayInTimezone());
  const [startDate, setStartDate] = useState(() => firstOfYearInTimezone());
  const [endDate, setEndDate] = useState(() => todayInTimezone());

  // Adjust dates when timezone changes (React render-time state adjustment pattern)
  const [prevTimezone, setPrevTimezone] = useState<string | undefined>();
  if (timezone && timezone !== prevTimezone) {
    setPrevTimezone(timezone);
    if (mode === "single") {
      setAsOfDate(todayInTimezone(timezone));
    } else {
      setStartDate(firstOfYearInTimezone(timezone));
      setEndDate(todayInTimezone(timezone));
    }
  }

  return {
    user,
    authLoading,
    timezone,
    asOfDate,
    setAsOfDate,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  };
}

const BackLink = () => (
  <Link
    href="/reports"
    className="group inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2 text-sm font-bold text-body shadow-sm hover:bg-surface-hover transition-all"
  >
    <svg
      className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    All Reports
  </Link>
);

export function ReportPageLayout({
  title,
  subtitle,
  reportSubtitle,
  children,
  onGenerate,
  loading,
  error,
  dateFields,
  dateError,
}: ReportPageLayoutProps) {
  const { user, loading: authLoading } = useAuth();

  const generate = async () => {
    if (!user?.business_id) return;
    await onGenerate(user.business_id);
  };

  if (authLoading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-secondary relative">
      <PageHeader
        title={title}
        subtitle={reportSubtitle || subtitle}
        actions={<BackLink />}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />

        <div className="flex flex-wrap items-end gap-4 mb-8">
          {dateFields.map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-bold text-body mb-1">{field.label}</label>
              <input
                type="date"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="rounded-xl border-0 py-2.5 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm"
              />
            </div>
          ))}
          <button
            onClick={generate}
            disabled={loading || !!dateError}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
        {dateError && (
          <p className="text-sm text-red-600 -mt-4 mb-6">{dateError}</p>
        )}

        {children({ generate })}
      </div>
    </div>
  );
}
