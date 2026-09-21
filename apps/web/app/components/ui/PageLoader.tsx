export function PageLoader() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-surface-secondary">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-edge border-t-[#087E78] dark:border-t-teal-400 animate-spin" />
        <p className="text-xs font-semibold text-muted">Loading...</p>
      </div>
    </div>
  );
}
