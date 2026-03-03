"use client";

/**
 * Inline banner shown to viewers on pages where write actions are unavailable.
 * Use inside list pages (above the table) or at the top of create/edit forms.
 */
export function ReadOnlyBanner({ action = "modify records" }: { action?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-6a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
      <span>
        <strong>View-only mode</strong> — your role does not allow you to {action}. Contact your administrator to upgrade your permissions.
      </span>
    </div>
  );
}
