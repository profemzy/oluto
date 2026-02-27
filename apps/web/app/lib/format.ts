const DEFAULT_TIMEZONE = "America/Toronto";

/**
 * Returns today's date as YYYY-MM-DD in the given IANA timezone.
 * Uses Intl.DateTimeFormat so the result is correct regardless of the
 * browser's local clock — it always reflects "now" in the business's province.
 */
export function todayInTimezone(timezone = DEFAULT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

/**
 * Returns a date offset by `days` from today, as YYYY-MM-DD in the given timezone.
 */
export function dateOffsetInTimezone(
  days: number,
  timezone = DEFAULT_TIMEZONE,
): string {
  const now = new Date();
  now.setDate(now.getDate() + days);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

/**
 * Returns January 1st of the current year in the given timezone as YYYY-MM-DD.
 */
export function firstOfYearInTimezone(timezone = DEFAULT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  return `${y}-01-01`;
}

export function formatCurrency(
  amount: string | number,
  currency = "CAD",
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(num);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  // Append T00:00:00 for date-only strings (YYYY-MM-DD) to parse as local time
  // instead of UTC, preventing off-by-one-day errors in Western Hemisphere timezones
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? dateStr + "T00:00:00"
    : dateStr;
  return new Date(normalized).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return formatDate(dateStr);
}
