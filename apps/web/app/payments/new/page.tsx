"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, Contact, Account, Invoice } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

const PAYMENT_METHODS = ["Cash", "Check", "Credit Card", "Bank Transfer", "Other"];

interface InvoiceApplication {
  invoice: Invoice;
  checked: boolean;
  amount: string;
}

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function NewPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const preCustomerId = searchParams.get("customerId") || "";
  const preInvoiceId = searchParams.get("invoiceId") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  const [customers, setCustomers] = useState<Contact[]>([]);
  const [assetAccounts, setAssetAccounts] = useState<Account[]>([]);

  const [customerId, setCustomerId] = useState(preCustomerId);
  const [paymentDate, setPaymentDate] = useState(todayStr());
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [depositToAccountId, setDepositToAccountId] = useState("");
  const [memo, setMemo] = useState("");

  const [invoiceApps, setInvoiceApps] = useState<InvoiceApplication[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  useEffect(() => {
    if (!user?.business_id) return;
    const load = async () => {
      try {
        const [custs, accts] = await Promise.all([
          api.getCustomers(user.business_id!),
          api.listAccounts(user.business_id!),
        ]);
        setCustomers(custs);
        setAssetAccounts(accts.filter((a) => a.account_type === "Asset" && a.is_active));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, [user?.business_id]);

  // Load outstanding invoices when customer changes
  useEffect(() => {
    if (!customerId) {
      setInvoiceApps([]);
      return;
    }
    const loadInvoices = async () => {
      setInvoicesLoading(true);
      try {
        const invoices = await api.getCustomerInvoices(user.business_id!, customerId);
        const outstanding = invoices.filter(
          (inv) => inv.status !== "paid" && inv.status !== "void" && parseFloat(inv.balance) > 0
        );
        setInvoiceApps(
          outstanding.map((inv) => ({
            invoice: inv,
            checked: inv.id === preInvoiceId,
            amount: inv.id === preInvoiceId ? inv.balance : "",
          }))
        );
      } catch {
        setInvoiceApps([]);
      } finally {
        setInvoicesLoading(false);
      }
    };
    loadInvoices();
  }, [customerId, preInvoiceId]);

  // Auto-distribute payment amount across invoices oldest-first
  const autoDistribute = () => {
    let remaining = parseFloat(amount) || 0;
    setInvoiceApps((prev) =>
      prev.map((app) => {
        if (remaining <= 0) return { ...app, checked: false, amount: "" };
        const balance = parseFloat(app.invoice.balance) || 0;
        const applied = Math.min(remaining, balance);
        remaining -= applied;
        return { ...app, checked: true, amount: applied.toFixed(2) };
      })
    );
  };

  const toggleInvoice = (index: number) => {
    setInvoiceApps((prev) => {
      const updated = [...prev];
      const app = updated[index];
      updated[index] = {
        ...app,
        checked: !app.checked,
        amount: !app.checked ? app.invoice.balance : "",
      };
      return updated;
    });
  };

  const updateApplicationAmount = (index: number, value: string) => {
    setInvoiceApps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], amount: value, checked: !!value };
      return updated;
    });
  };

  const totalApplied = invoiceApps.reduce(
    (sum, app) => sum + (app.checked ? parseFloat(app.amount) || 0 : 0),
    0
  );
  const unapplied = (parseFloat(amount) || 0) - totalApplied;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const applications = invoiceApps
        .filter((app) => app.checked && parseFloat(app.amount) > 0)
        .map((app) => ({
          invoice_id: app.invoice.id,
          amount_applied: app.amount,
        }));

      await api.createPayment(user.business_id!, {
        customer_id: customerId,
        payment_date: paymentDate,
        amount,
        payment_method: paymentMethod,
        reference_number: referenceNumber || undefined,
        deposit_to_account_id: depositToAccountId || undefined,
        memo: memo || undefined,
        applications,
      });
      router.push("/payments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payment");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <PageLoader />;

  return (
    <div className="bg-white/90 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-gray-900/5 rounded-2xl border border-gray-100 sm:px-10">
      <ErrorAlert error={error} className="mb-6" />
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Payment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            <label htmlFor="paymentDate" className="block text-sm font-bold leading-6 text-gray-900">Payment Date</label>
            <input id="paymentDate" type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-bold leading-6 text-gray-900">Amount</label>
            <input id="amount" type="number" required min="0.01" step="0.01" placeholder="0.00"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
          </div>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-bold leading-6 text-gray-900">Payment Method</label>
            <select id="paymentMethod" required value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm bg-white transition-all hover:ring-gray-400">
              <option value="">Select method</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="referenceNumber" className="block text-sm font-bold leading-6 text-gray-900">Reference # <span className="text-gray-400 font-normal">(optional)</span></label>
            <input id="referenceNumber" type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
          </div>
          <div>
            <label htmlFor="depositTo" className="block text-sm font-bold leading-6 text-gray-900">Deposit To <span className="text-gray-400 font-normal">(optional)</span></label>
            <select id="depositTo" value={depositToAccountId} onChange={(e) => setDepositToAccountId(e.target.value)}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm bg-white transition-all hover:ring-gray-400">
              <option value="">Select account</option>
              {assetAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-bold leading-6 text-gray-900">Memo <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea id="memo" rows={2} value={memo} onChange={(e) => setMemo(e.target.value)}
            className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400 resize-none" />
        </div>

        {/* Apply to Invoices */}
        {customerId && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Apply to Invoices</h3>
              {invoiceApps.length > 0 && amount && (
                <button
                  type="button"
                  onClick={autoDistribute}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-100 transition-colors"
                >
                  Auto-distribute
                </button>
              )}
            </div>

            {invoicesLoading ? (
              <p className="text-sm text-gray-500 py-4">Loading invoices...</p>
            ) : invoiceApps.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-500">No outstanding invoices for this customer.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1"></div>
                  <div className="col-span-3">Invoice #</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-2 text-right">Balance</div>
                  <div className="col-span-2 text-right">Apply</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {invoiceApps.map((app, idx) => (
                    <div key={app.invoice.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 items-center">
                      <div className="col-span-1 flex items-center">
                        <input
                          type="checkbox"
                          checked={app.checked}
                          onChange={() => toggleInvoice(idx)}
                          className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                      </div>
                      <div className="col-span-3 text-sm font-medium text-gray-900">{app.invoice.invoice_number}</div>
                      <div className="col-span-2 text-sm text-gray-600">
                        {new Date(app.invoice.invoice_date + "T00:00:00").toLocaleDateString("en-CA")}
                      </div>
                      <div className="col-span-2 text-sm text-gray-600 text-right">{formatCurrency(app.invoice.total_amount)}</div>
                      <div className="col-span-2 text-sm font-medium text-amber-600 text-right">{formatCurrency(app.invoice.balance)}</div>
                      <div className="col-span-2">
                        <input
                          type="number" min="0" step="0.01"
                          max={app.invoice.balance}
                          placeholder="0.00"
                          value={app.amount}
                          onChange={(e) => updateApplicationAmount(idx, e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-right text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 transition-all hover:ring-gray-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Application Summary */}
                <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                  <div className="flex justify-end gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Applied: </span>
                      <span className="font-bold text-gray-900">${totalApplied.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Unapplied: </span>
                      <span className={`font-bold ${unapplied > 0 ? "text-amber-600" : "text-green-600"}`}>
                        ${Math.max(0, unapplied).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 flex justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-glow">
            {loading ? "Recording..." : "Record Payment"}
          </button>
          <Link href="/payments" className="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewPaymentPage() {
  const { loading: authLoading } = useAuth();

  if (authLoading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="Record Payment"
        subtitle="Record a customer payment"
        actions={
          <Link href="/payments" className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Payments
          </Link>
        }
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Suspense fallback={<PageLoader />}>
          <NewPaymentForm />
        </Suspense>
      </div>
    </div>
  );
}
