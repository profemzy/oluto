"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  Contact,
  Account,
  CreateInvoiceLineItemRequest,
} from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

interface LineItemRow extends CreateInvoiceLineItemRequest {
  amount: string;
}

function calcLineAmount(qty: string, price: string, discountPct: string): string {
  const q = parseFloat(qty) || 0;
  const p = parseFloat(price) || 0;
  const d = parseFloat(discountPct) || 0;
  const amt = q * p * (1 - d / 100);
  return amt.toFixed(2);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function plus30(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

const emptyLine = (): LineItemRow => ({
  line_number: 1,
  item_description: "",
  quantity: "1",
  unit_price: "",
  discount_percent: undefined,
  tax_code: undefined,
  revenue_account_id: "",
  amount: "0.00",
});

export default function NewInvoicePage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customers, setCustomers] = useState<Contact[]>([]);
  const [revenueAccounts, setRevenueAccounts] = useState<Account[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayStr());
  const [dueDate, setDueDate] = useState(plus30());
  const [shipDate, setShipDate] = useState("");
  const [customerMemo, setCustomerMemo] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyLine()]);

  useEffect(() => {
    const load = async () => {
      try {
        const [custs, accts, invoices] = await Promise.all([
          api.getCustomers(),
          api.listAccounts(),
          api.listInvoices(),
        ]);
        setCustomers(custs);
        setRevenueAccounts(accts.filter((a) => a.account_type === "Revenue" && a.is_active));

        // Auto-generate next invoice number (INV-0001, INV-0002, ...)
        let maxNum = 0;
        for (const inv of invoices) {
          const match = inv.invoice_number.match(/^INV-(\d+)$/);
          if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
        }
        setInvoiceNumber(`INV-${String(maxNum + 1).padStart(4, "0")}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []);

  // Auto-fill billing/shipping address from selected customer
  useEffect(() => {
    if (!customerId) return;
    const c = customers.find((c) => c.id === customerId);
    if (c) {
      if (c.billing_address) setBillingAddress(c.billing_address);
      if (c.shipping_address) setShippingAddress(c.shipping_address);
    }
  }, [customerId, customers]);

  const updateLineItem = (index: number, field: keyof LineItemRow, value: string) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      item.amount = calcLineAmount(item.quantity, item.unit_price, item.discount_percent || "0");
      updated[index] = item;
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { ...emptyLine(), line_number: prev.length + 1 },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((item, i) => ({ ...item, line_number: i + 1 }));
    });
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.createInvoice({
        invoice_number: invoiceNumber,
        customer_id: customerId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        ship_date: shipDate || undefined,
        customer_memo: customerMemo || undefined,
        billing_address: billingAddress || undefined,
        shipping_address: shippingAddress || undefined,
        line_items: lineItems.map((item) => ({
          line_number: item.line_number,
          item_description: item.item_description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent || undefined,
          tax_code: item.tax_code || undefined,
          revenue_account_id: item.revenue_account_id,
        })),
      });
      router.push(`/invoices/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || dataLoading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="New Invoice"
        subtitle="Create an invoice for a customer"
        actions={
          <Link href="/invoices" className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Invoices
          </Link>
        }
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-gray-900/5 rounded-2xl border border-gray-100 sm:px-10">
          <ErrorAlert error={error} className="mb-6" />
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Header Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-bold leading-6 text-gray-900">Invoice Number</label>
                <input id="invoiceNumber" type="text" required value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
              <div>
                <label htmlFor="customerId" className="block text-sm font-bold leading-6 text-gray-900">Customer</label>
                <select id="customerId" required value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm bg-white transition-all hover:ring-gray-400">
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="invoiceDate" className="block text-sm font-bold leading-6 text-gray-900">Invoice Date</label>
                <input id="invoiceDate" type="date" required value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-bold leading-6 text-gray-900">Due Date</label>
                <input id="dueDate" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
              <div>
                <label htmlFor="shipDate" className="block text-sm font-bold leading-6 text-gray-900">Ship Date <span className="text-gray-400 font-normal">(optional)</span></label>
                <input id="shipDate" type="date" value={shipDate} onChange={(e) => setShipDate(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="billingAddress" className="block text-sm font-bold leading-6 text-gray-900">Billing Address <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea id="billingAddress" rows={2} value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400 resize-none" />
              </div>
              <div>
                <label htmlFor="shippingAddress" className="block text-sm font-bold leading-6 text-gray-900">Shipping Address <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea id="shippingAddress" rows={2} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400 resize-none" />
              </div>
            </div>

            <div>
              <label htmlFor="customerMemo" className="block text-sm font-bold leading-6 text-gray-900">Customer Memo <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea id="customerMemo" rows={2} value={customerMemo} onChange={(e) => setCustomerMemo(e.target.value)}
                className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400 resize-none" />
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Line Items</h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Line
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="hidden lg:grid lg:grid-cols-12 gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-1">Disc %</div>
                  <div className="col-span-2">Account</div>
                  <div className="col-span-1 text-right">Amount</div>
                  <div className="col-span-1"></div>
                </div>
                <div className="divide-y divide-gray-100">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-2 px-4 py-3 items-center">
                      <div className="col-span-1 text-sm text-gray-500 font-medium hidden lg:block">{idx + 1}</div>
                      <div className="col-span-3">
                        <input
                          type="text" required placeholder="Description"
                          value={item.item_description} onChange={(e) => updateLineItem(idx, "item_description", e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 transition-all hover:ring-gray-400"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number" required min="0" step="0.001" placeholder="Qty"
                          value={item.quantity} onChange={(e) => updateLineItem(idx, "quantity", e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 transition-all hover:ring-gray-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number" required min="0" step="0.01" placeholder="0.00"
                          value={item.unit_price} onChange={(e) => updateLineItem(idx, "unit_price", e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 transition-all hover:ring-gray-400"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number" min="0" max="100" step="0.01" placeholder="%"
                          value={item.discount_percent || ""} onChange={(e) => updateLineItem(idx, "discount_percent", e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 transition-all hover:ring-gray-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          required value={item.revenue_account_id} onChange={(e) => updateLineItem(idx, "revenue_account_id", e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 bg-white transition-all hover:ring-gray-400"
                        >
                          <option value="">Account</option>
                          {revenueAccounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="text-sm font-bold text-gray-900">${item.amount}</p>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          disabled={lineItems.length <= 1}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="mt-4 flex justify-end">
                <div className="w-64 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-700">Subtotal</span>
                    <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 flex justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-glow">
                {loading ? "Creating..." : "Create Invoice"}
              </button>
              <Link href="/invoices" className="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
