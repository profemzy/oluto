export interface NavItem {
  name: string;
  href: string;
  iconKey: string;
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", iconKey: "Dashboard" },
      { name: "Daily Briefing", href: "/daily-briefings", iconKey: "Briefing" },
      { name: "Agent Operations", href: "/chat", iconKey: "Agent", badge: "Live" },
      { name: "Transactions", href: "/transactions", iconKey: "Transactions" },
    ],
  },
  {
    title: "Money In",
    items: [
      { name: "Invoices", href: "/invoices", iconKey: "Invoices" },
      { name: "Payments Received", href: "/payments", iconKey: "Payments" },
      { name: "Customers", href: "/contacts", iconKey: "Contacts" },
    ],
  },
  {
    title: "Money Out",
    items: [
      { name: "Bills", href: "/bills", iconKey: "Bills" },
      { name: "Vendors", href: "/contacts?type=vendor", iconKey: "Contacts" },
    ],
  },
  {
    title: "Accounting",
    items: [
      { name: "Chart of Accounts", href: "/accounts", iconKey: "Accounts" },
      { name: "Reconciliation", href: "/reconciliation", iconKey: "Reconciliation" },
      { name: "Financial Reports", href: "/reports", iconKey: "Reports" },
    ],
  },
  {
    title: "Administration",
    items: [
      { name: "Team & Access", href: "/settings/team", iconKey: "Team" },
      { name: "Settings", href: "/settings", iconKey: "Settings" },
    ],
  },
];

export function getSectionTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/daily-briefings")) return "Daily Briefing";
  if (pathname.startsWith("/chat")) return "Agent Operations";
  if (pathname.startsWith("/transactions")) return "Transactions";
  if (pathname.startsWith("/invoices")) return "Invoices";
  if (pathname.startsWith("/bills")) return "Bills";
  if (pathname.startsWith("/payments")) return "Payments";
  if (pathname.startsWith("/contacts")) return "Contacts";
  if (pathname.startsWith("/accounts")) return "Chart of Accounts";
  if (pathname.startsWith("/reconciliation")) return "Bank Reconciliation";
  if (pathname.startsWith("/reports")) return "Financial Reports";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/onboarding")) return "Setup";
  return "Oluto Finance";
}
