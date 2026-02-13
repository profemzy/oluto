"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Invoice, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

const STATUS_FILTERS = [
  { value: "", label: "All Invoices" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "void", label: "Void" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 ring-gray-300",
  sent: "bg-blue-50 text-blue-700 ring-blue-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-green-50 text-green-700 ring-green-200",
  overdue: "bg-red-50 text-red-700 ring-red-200",
  void: "bg-slate-100 text-slate-500 ring-slate-300",
};

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA");
}

export default function InvoicesPage() {
  const { loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Record<string, string>>({});
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [invoiceData, customerData, overdueData] = await Promise.all([
          api.listInvoices(statusFilter ? { status: statusFilter } : undefined),
          api.getCustomers(),
          api.getOverdueInvoices(),
        ]);
        setInvoices(invoiceData);
        const map: Record<string, string> = {};
        customerData.forEach((c: Contact) => { map[c.id] = c.name; });
        setCustomers(map);
        setOverdueCount(overdueData.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    load();
  }, [statusFilter]);

  if (authLoading || loading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />

        {overdueCount > 0 && !statusFilter && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm font-bold text-red-700">
                {overdueCount} overdue invoice{overdueCount === 1 ? "" : "s"} require attention
              </p>
              <button
                onClick={() => setStatusFilter("overdue")}
                className="ml-auto text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
              >
                View overdue
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm bg-white"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <Link
            href="/invoices/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Invoice
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first invoice to start tracking receivables.</p>
            <Link href="/invoices/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md">
              New Invoice
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Invoice #</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Due Date</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Balance</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-cyan-50/50 transition-all items-center"
                >
                  <div className="col-span-2">
                    <p className="text-sm font-bold text-gray-900">{invoice.invoice_number}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 truncate">{customers[invoice.customer_id] || "\u2014"}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-gray-600">{formatDate(invoice.invoice_date)}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-gray-600">{formatDate(invoice.due_date)}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(invoice.total_amount)}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className={`text-sm font-bold ${parseFloat(invoice.balance) > 0 ? "text-amber-600" : "text-green-600"}`}>
                      {formatCurrency(invoice.balance)}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset capitalize ${STATUS_COLORS[invoice.status] || "bg-gray-100 text-gray-700"}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <span className="p-2 rounded-lg text-gray-400 group-hover:text-cyan-600 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
