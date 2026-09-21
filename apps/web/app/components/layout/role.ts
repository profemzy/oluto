export interface RoleDisplay {
  label: string;
  color: string;
}

export function getRoleDisplay(role: string | null | undefined, loading: boolean): RoleDisplay {
  if (loading || !role) {
    return {
      label: "Loading access...",
      color: "bg-surface-secondary text-muted border-edge animate-pulse",
    };
  }
  switch (role) {
    case "owner":
      return {
        label: "Owner",
        color: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      };
    case "administrator":
    case "admin":
      return {
        label: "Admin",
        color: "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
      };
    case "accountant":
      return {
        label: "Accountant",
        color: "bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
      };
    default:
      return {
        label: "Viewer",
        color: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      };
  }
}
