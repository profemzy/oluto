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
  draft: "bg-gray-100 text-gray-700",
  processing: "bg-blue-50 text-blue-700",
  inbox_user: "bg-amber-50 text-amber-700",
  inbox_firm: "bg-purple-50 text-purple-700",
  ready: "bg-emerald-50 text-emerald-700",
  posted: "bg-cyan-50 text-cyan-700",
  void: "bg-red-50 text-red-700",
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
  open: "bg-blue-50 text-blue-700 ring-blue-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-green-50 text-green-700 ring-green-200",
  void: "bg-slate-100 text-slate-500 ring-slate-300",
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
  draft: "bg-gray-100 text-gray-700 ring-gray-200",
  sent: "bg-blue-50 text-blue-700 ring-blue-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-green-50 text-green-700 ring-green-200",
  overdue: "bg-red-50 text-red-700 ring-red-200",
  void: "bg-slate-100 text-slate-500 ring-slate-300",
};

export const CONTACT_TYPE_FILTERS = [
  { value: "", label: "All Contacts" },
  { value: "Customer", label: "Customers" },
  { value: "Vendor", label: "Vendors" },
  { value: "Employee", label: "Employees" },
] as const;

export const CONTACT_TYPE_COLORS: Record<string, string> = {
  Customer: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Vendor: "bg-amber-50 text-amber-700 ring-amber-200",
  Employee: "bg-purple-50 text-purple-700 ring-purple-200",
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
  Asset: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Liability: "bg-red-50 text-red-700 ring-red-200",
  Equity: "bg-blue-50 text-blue-700 ring-blue-200",
  Revenue: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Expense: "bg-amber-50 text-amber-700 ring-amber-200",
};
