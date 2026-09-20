"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ErrorAlert, PageHeader } from "@/app/components";
import { useAuth } from "@/app/hooks/useAuth";
import { api } from "@/app/lib/api";
import type { AutomationResponse, DailyBriefingResponse } from "@/app/lib/generated/agent-api";

function scheduleTime(automation: AutomationResponse | undefined): string {
  const [minute = "0", hour = "8"] = automation?.cron_expression.split(" ") ?? [];
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function cronFromTime(value: string): string {
  const [hour, minute] = value.split(":");
  return `${Number(minute)} ${Number(hour)} * * *`;
}

function formatScheduledTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function DailyBriefingsPage() {
  const { user, loading: authLoading, timezone, canAdmin } = useAuth();
  const [automation, setAutomation] = useState<AutomationResponse>();
  const [briefings, setBriefings] = useState<DailyBriefingResponse[]>([]);
  const [time, setTime] = useState("08:00");
  const [locale, setLocale] = useState<"en-CA" | "fr-CA">("en-CA");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.business_id) return;
    setError("");
    try {
      const [automations, delivered] = await Promise.all([
        api.chat.listAutomations(user.business_id),
        api.chat.listDailyBriefings(user.business_id),
      ]);
      const current = automations.find((item) => item.workflow_name === "daily_briefing");
      setAutomation(current);
      setBriefings(delivered);
      setTime(scheduleTime(current));
      setLocale(current?.locale ?? "en-CA");
      setEnabled(current?.status === "active");
    } catch {
      setError("Daily Briefing could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.business_id]);

  useEffect(() => {
    void load();
  }, [load]);

  const nextSummary = useMemo(
    () => `${time} ${timezone.replaceAll("_", " ").replace("/", " ")} · ${locale}`,
    [locale, time, timezone]
  );

  async function saveSchedule() {
    if (!user?.business_id) return;
    setSaving(true);
    setError("");
    try {
      const saved = await api.chat.saveDailyBriefingSchedule(user.business_id, {
        automation,
        name: automation?.name ?? "Daily Finance Briefing",
        locale,
        cronExpression: cronFromTime(time),
        timeZoneName: timezone,
        status: enabled ? "active" : "paused",
      });
      setAutomation(saved);
      toast.success("Daily Briefing schedule saved");
    } catch {
      setError("The schedule could not be saved. Refresh and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12" aria-busy="true">
        <div className="bg-surface h-48 animate-pulse rounded-2xl" />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <PageHeader
        title="Daily Briefing"
        subtitle="Your scheduled financial overview, prepared even when Oluto is closed."
      />
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <ErrorAlert error={error} />

        <section className="border-edge-subtle bg-surface rounded-2xl border p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-heading text-xl font-bold">Delivery schedule</h2>
              <p className="text-caption mt-1 text-sm">{nextSummary}</p>
            </div>
            <label className="text-body flex items-center gap-3 font-semibold">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
                disabled={!canAdmin}
                className="border-edge h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"
              />
              Deliver every day
            </label>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-body space-y-2 text-sm font-semibold">
              Delivery time
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                disabled={!canAdmin}
                className="border-edge bg-surface text-heading block w-full rounded-xl border px-3 py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
              />
            </label>
            <label className="text-body space-y-2 text-sm font-semibold">
              Briefing language
              <select
                value={locale}
                onChange={(event) => setLocale(event.target.value as "en-CA" | "fr-CA")}
                disabled={!canAdmin}
                className="border-edge bg-surface text-heading block w-full rounded-xl border px-3 py-2 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
              >
                <option value="en-CA">English (Canada)</option>
                <option value="fr-CA">Français (Canada)</option>
              </select>
            </label>
          </div>

          {canAdmin ? (
            <button
              type="button"
              onClick={saveSchedule}
              disabled={saving}
              className="mt-6 rounded-xl bg-cyan-600 px-5 py-2.5 font-bold text-white transition hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:outline-none disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save schedule"}
            </button>
          ) : (
            <p className="text-caption mt-6 text-sm">
              An owner or administrator can change this schedule.
            </p>
          )}
        </section>

        <section aria-labelledby="briefing-history-title">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="briefing-history-title" className="text-heading text-xl font-bold">
              Briefing history
            </h2>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              Refresh
            </button>
          </div>

          {briefings.length === 0 ? (
            <div className="border-edge bg-surface rounded-2xl border border-dashed p-10 text-center">
              <p className="text-heading font-semibold">No briefings yet</p>
              <p className="text-caption mt-1 text-sm">
                The first one will appear after the next scheduled delivery.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {briefings.map((briefing) => (
                <article
                  key={briefing.run_id}
                  className="border-edge-subtle bg-surface rounded-2xl border p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <time className="text-heading font-bold" dateTime={briefing.scheduled_for}>
                      {formatScheduledTime(briefing.scheduled_for, briefing.locale)}
                    </time>
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold tracking-wide text-cyan-800 uppercase">
                      {briefing.status}
                    </span>
                  </div>
                  {briefing.answer ? (
                    <p className="text-body mt-5 leading-7 whitespace-pre-wrap">
                      {briefing.answer}
                    </p>
                  ) : (
                    <p className="text-caption mt-5">This briefing is still being prepared.</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
