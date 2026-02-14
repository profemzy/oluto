export const TRANSACTION_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "processing", label: "Processing" },
  { value: "inbox_user", label: "Inbox (User)" },
  { value: "inbox_firm", label: "Inbox (Firm)" },
  { value: "ready", label: "Ready" },
  { value: "posted", label: "Posted" },
  { value: "void", label: "Void" },
] as const;

export const TRANSACTION_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  processing: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  inbox_user: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
  inbox_firm: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
  ready: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
  posted: "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300",
  void: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
};

export const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["processing", "inbox_user", "inbox_firm", "ready", "posted", "void"],
  processing: ["inbox_user", "inbox_firm", "ready", "posted", "void"],
  inbox_user: ["ready", "posted", "void"],
  inbox_firm: ["ready", "posted", "void"],
  ready: ["posted", "void"],
  posted: ["void"],
  void: [],
};

export const BILL_STATUS_OPTIONS = [
  { value: "", label: "All Bills" },
  { value: "open", label: "Open" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "void", label: "Void" },
] as const;

export const BILL_STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-blue-200 dark:ring-blue-800",
  partial: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-800",
  paid: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 ring-green-200 dark:ring-green-800",
  void: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-slate-300 dark:ring-slate-600",
};

export const INVOICE_STATUS_OPTIONS = [
  { value: "", label: "All Invoices" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "void", label: "Void" },
] as const;

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-gray-200 dark:ring-gray-700",
  sent: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-blue-200 dark:ring-blue-800",
  partial: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-800",
  paid: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 ring-green-200 dark:ring-green-800",
  overdue: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 ring-red-200 dark:ring-red-800",
  void: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-slate-300 dark:ring-slate-600",
};

export const CONTACT_TYPE_FILTERS = [
  { value: "", label: "All Contacts" },
  { value: "Customer", label: "Customers" },
  { value: "Vendor", label: "Vendors" },
  { value: "Employee", label: "Employees" },
] as const;

export const CONTACT_TYPE_COLORS: Record<string, string> = {
  Customer: "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 ring-cyan-200 dark:ring-cyan-800",
  Vendor: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-800",
  Employee: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 ring-purple-200 dark:ring-purple-800",
};

export const ACCOUNT_TYPE_FILTERS = [
  { value: "", label: "All Types" },
  { value: "Asset", label: "Assets" },
  { value: "Liability", label: "Liabilities" },
  { value: "Equity", label: "Equity" },
  { value: "Revenue", label: "Revenue" },
  { value: "Expense", label: "Expenses" },
] as const;

export const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  Asset: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800",
  Liability: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 ring-red-200 dark:ring-red-800",
  Equity: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-blue-200 dark:ring-blue-800",
  Revenue: "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 ring-cyan-200 dark:ring-cyan-800",
  Expense: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-800",
};
