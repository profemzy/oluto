"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { api, InvoiceWithLineItems, Payment, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 ring-gray-300",
  sent: "bg-blue-50 text-blue-700 ring-blue-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-green-50 text-green-700 ring-green-200",
  overdue: "bg-red-50 text-red-700 ring-red-200",
  void: "bg-slate-100 text-slate-500 ring-slate-300",
};

const STATUS_ACTIONS: Record<string, { label: string; status: string; color: string }[]> = {
  draft: [
    { label: "Mark Sent", status: "sent", color: "from-blue-500 to-blue-600" },
    { label: "Void", status: "void", color: "from-slate-400 to-slate-500" },
  ],
  sent: [
    { label: "Void", status: "void", color: "from-slate-400 to-slate-500" },
  ],
  partial: [
    { label: "Void", status: "void", color: "from-slate-400 to-slate-500" },
  ],
  overdue: [
    { label: "Void", status: "void", color: "from-slate-400 to-slate-500" },
  ],
};

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA");
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: invoiceId } = use(params);
  const { loading: authLoading } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceWithLineItems | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadInvoice = async () => {
    try {
      const [inv, pmts] = await Promise.all([
        api.getInvoice(invoiceId),
        api.getInvoicePayments(invoiceId),
      ]);
      setInvoice(inv);
      setPayments(pmts);
      try {
        const customers = await api.getCustomers();
        const customer = customers.find((c: Contact) => c.id === inv.customer_id);
        if (customer) setCustomerName(customer.name);
      } catch {
        /* customer lookup is non-critical */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!invoice) return;
    setUpdating(true);
    setError("");
    try {
      const updated = await api.updateInvoiceStatus(invoiceId, newStatus);
      setInvoice({ ...invoice, ...updated });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) return <PageLoader />;
  if (!invoice) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Invoice not found</h2>
          <Link href="/invoices" className="text-sm text-cyan-600 hover:text-cyan-800 font-medium">Back to Invoices</Link>
        </div>
      </div>
    );
  }

  const actions = STATUS_ACTIONS[invoice.status] || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title={`Invoice ${invoice.invoice_number}`}
        subtitle={customerName || undefined}
        actions={
          <Link href="/invoices" className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Invoices
          </Link>
        }
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6">
        <ErrorAlert error={error} className="mb-2" />

        {/* Invoice Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{invoice.invoice_number}</h2>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset capitalize ${STATUS_COLORS[invoice.status]}`}>
                  {invoice.status}
                </span>
              </div>
              {customerName && <p className="text-sm text-gray-600">{customerName}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {invoice.status !== "paid" && invoice.status !== "void" && (
                <Link
                  href={`/payments/new?invoiceId=${invoiceId}&customerId=${invoice.customer_id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Record Payment
                </Link>
              )}
              {actions.map((action) => (
                <button
                  key={action.status}
                  onClick={() => handleStatusChange(action.status)}
                  disabled={updating}
                  className={`inline-flex items-center rounded-xl bg-gradient-to-r ${action.color} px-4 py-2 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Invoice Date</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(invoice.invoice_date)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Due Date</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(invoice.due_date)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Total</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(invoice.total_amount)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Balance Due</p>
              <p className={`text-sm font-bold mt-1 ${parseFloat(invoice.balance) > 0 ? "text-amber-600" : "text-green-600"}`}>
                {formatCurrency(invoice.balance)}
              </p>
            </div>
          </div>

          {(invoice.customer_memo || invoice.billing_address || invoice.shipping_address) && (
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {invoice.billing_address && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Billing Address</p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{invoice.billing_address}</p>
                </div>
              )}
              {invoice.shipping_address && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Shipping Address</p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{invoice.shipping_address}</p>
                </div>
              )}
              {invoice.customer_memo && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Memo</p>
                  <p className="text-sm text-gray-700 mt-1">{invoice.customer_memo}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Line Items</h3>
          </div>
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-1 text-right">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-1 text-right">Disc %</div>
            <div className="col-span-3 text-right">Amount</div>
          </div>
          <div className="divide-y divide-gray-100">
            {invoice.line_items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-3 items-center">
                <div className="col-span-1 text-sm text-gray-500">{item.line_number}</div>
                <div className="col-span-4 text-sm text-gray-900 font-medium">{item.item_description}</div>
                <div className="col-span-1 text-sm text-gray-600 text-right">{item.quantity}</div>
                <div className="col-span-2 text-sm text-gray-600 text-right">{formatCurrency(item.unit_price)}</div>
                <div className="col-span-1 text-sm text-gray-600 text-right">
                  {item.discount_percent && parseFloat(item.discount_percent) > 0 ? `${item.discount_percent}%` : "\u2014"}
                </div>
                <div className="col-span-3 text-sm font-bold text-gray-900 text-right">{formatCurrency(item.amount)}</div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="text-sm font-bold text-gray-900">
                Total: {formatCurrency(invoice.total_amount)}
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Payment History</h3>
          </div>
          {payments.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-gray-500">No payments recorded yet.</p>
            </div>
          ) : (
            <>
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">Payment #</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Method</div>
                <div className="col-span-3 text-right">Amount</div>
                <div className="col-span-2"></div>
              </div>
              <div className="divide-y divide-gray-100">
                {payments.map((pmt) => (
                  <div key={pmt.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-3 items-center">
                    <div className="col-span-3 text-sm font-medium text-gray-900">{pmt.payment_number || "\u2014"}</div>
                    <div className="col-span-2 text-sm text-gray-600">{formatDate(pmt.payment_date)}</div>
                    <div className="col-span-2 text-sm text-gray-600 capitalize">{pmt.payment_method}</div>
                    <div className="col-span-3 text-sm font-bold text-green-600 text-right">{formatCurrency(pmt.amount)}</div>
                    <div className="col-span-2 flex justify-end">
                      <Link href={`/payments/${pmt.id}`} className="text-xs font-medium text-cyan-600 hover:text-cyan-800">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
