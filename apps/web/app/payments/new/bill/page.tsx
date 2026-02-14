"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, Contact, Account, Bill } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

const PAYMENT_METHODS = ["Cash", "Check", "Credit Card", "Bank Transfer", "Other"];

interface BillApplication {
  bill: Bill;
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

function NewBillPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const preVendorId = searchParams.get("vendorId") || "";
  const preBillId = searchParams.get("billId") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  const [vendors, setVendors] = useState<Contact[]>([]);
  const [assetAccounts, setAssetAccounts] = useState<Account[]>([]);

  const [vendorId, setVendorId] = useState(preVendorId);
  const [paymentDate, setPaymentDate] = useState(todayStr());
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [memo, setMemo] = useState("");

  const [billApps, setBillApps] = useState<BillApplication[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);

  useEffect(() => {
    if (!user?.business_id) return;
    const load = async () => {
      try {
        const [vends, accts] = await Promise.all([
          api.getVendors(user.business_id!),
          api.listAccounts(user.business_id!),
        ]);
        setVendors(vends);
        setAssetAccounts(accts.filter((a) => a.account_type === "Asset" && a.is_active));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, [user?.business_id]);

  // Load outstanding bills when vendor changes
  useEffect(() => {
    if (!vendorId || !user?.business_id) {
      setBillApps([]);
      return;
    }
    const loadBills = async () => {
      setBillsLoading(true);
      try {
        const bills = await api.getVendorBills(user.business_id!, vendorId);
        const outstanding = bills.filter(
          (b) => b.status !== "void" && parseFloat(b.balance) > 0
        );
        setBillApps(
          outstanding.map((b) => ({
            bill: b,
            checked: b.id === preBillId,
            amount: b.id === preBillId ? b.balance : "",
          }))
        );
      } catch {
        setBillApps([]);
      } finally {
        setBillsLoading(false);
      }
    };
    loadBills();
  }, [vendorId, preBillId, user?.business_id]);

  const autoDistribute = () => {
    let remaining = parseFloat(amount) || 0;
    setBillApps((prev) =>
      prev.map((app) => {
        if (remaining <= 0) return { ...app, checked: false, amount: "" };
        const balance = parseFloat(app.bill.balance) || 0;
        const applied = Math.min(remaining, balance);
        remaining -= applied;
        return { ...app, checked: true, amount: applied.toFixed(2) };
      })
    );
  };

  const toggleBill = (index: number) => {
    setBillApps((prev) => {
      const updated = [...prev];
      const app = updated[index];
      updated[index] = {
        ...app,
        checked: !app.checked,
        amount: !app.checked ? app.bill.balance : "",
      };
      return updated;
    });
  };

  const updateApplicationAmount = (index: number, value: string) => {
    setBillApps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], amount: value, checked: !!value };
      return updated;
    });
  };

  const totalApplied = billApps.reduce(
    (sum, app) => sum + (app.checked ? parseFloat(app.amount) || 0 : 0),
    0
  );
  const unapplied = (parseFloat(amount) || 0) - totalApplied;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const applications = billApps
        .filter((app) => app.checked && parseFloat(app.amount) > 0)
        .map((app) => ({
          bill_id: app.bill.id,
          amount_applied: app.amount,
        }));

      await api.createBillPayment(user.business_id!, {
        vendor_id: vendorId,
        payment_date: paymentDate,
        amount,
        payment_method: paymentMethod,
        reference_number: referenceNumber || undefined,
        bank_account_id: bankAccountId || undefined,
        memo: memo || undefined,
        applications,
      });
      router.push("/bills");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bill payment");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <PageLoader />;

  return (
    <div className="bg-surface/90 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-gray-900/5 rounded-2xl border border-edge-subtle sm:px-10">
      <ErrorAlert error={error} className="mb-6" />
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Payment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="vendorId" className="block text-sm font-bold leading-6 text-heading">Vendor</label>
            <select id="vendorId" required value={vendorId} onChange={(e) => setVendorId(e.target.value)}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm bg-surface transition-all hover:ring-gray-400">
              <option value="">Select a vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-bold leading-6 text-heading">Payment Date</label>
            <input id="paymentDate" type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-bold leading-6 text-heading">Amount</label>
            <input id="amount" type="number" required min="0.01" step="0.01" placeholder="0.00"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
          </div>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-bold leading-6 text-heading">Payment Method</label>
            <select id="paymentMethod" required value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm bg-surface transition-all hover:ring-gray-400">
              <option value="">Select method</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="referenceNumber" className="block text-sm font-bold leading-6 text-heading">Reference # <span className="text-caption font-normal">(optional)</span></label>
            <input id="referenceNumber" type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
          </div>
          <div>
            <label htmlFor="bankAccount" className="block text-sm font-bold leading-6 text-heading">Bank Account <span className="text-caption font-normal">(optional)</span></label>
            <select id="bankAccount" value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm bg-surface transition-all hover:ring-gray-400">
              <option value="">Select account</option>
              {assetAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-bold leading-6 text-heading">Memo <span className="text-caption font-normal">(optional)</span></label>
          <textarea id="memo" rows={2} value={memo} onChange={(e) => setMemo(e.target.value)}
            className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400 resize-none" />
        </div>

        {/* Apply to Bills */}
        {vendorId && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-heading">Apply to Bills</h3>
              {billApps.length > 0 && amount && (
                <button
                  type="button"
                  onClick={autoDistribute}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950 px-3 py-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors"
                >
                  Auto-distribute
                </button>
              )}
            </div>

            {billsLoading ? (
              <p className="text-sm text-muted py-4">Loading bills...</p>
            ) : billApps.length === 0 ? (
              <div className="bg-surface-secondary rounded-xl p-6 text-center">
                <p className="text-sm text-muted">No outstanding bills for this vendor.</p>
              </div>
            ) : (
              <div className="border border-edge rounded-xl overflow-hidden">
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-4 py-3 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge text-xs font-bold text-muted uppercase tracking-wider">
                  <div className="col-span-1"></div>
                  <div className="col-span-3">Bill #</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-2 text-right">Balance</div>
                  <div className="col-span-2 text-right">Apply</div>
                </div>
                <div className="divide-y divide-edge-subtle">
                  {billApps.map((app, idx) => (
                    <div key={app.bill.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 items-center">
                      <div className="col-span-1 flex items-center">
                        <input
                          type="checkbox"
                          checked={app.checked}
                          onChange={() => toggleBill(idx)}
                          className="h-4 w-4 rounded border-edge text-cyan-600 focus:ring-cyan-500"
                        />
                      </div>
                      <div className="col-span-3 text-sm font-medium text-heading">{app.bill.bill_number || "\u2014"}</div>
                      <div className="col-span-2 text-sm text-body">
                        {new Date(app.bill.bill_date + "T00:00:00").toLocaleDateString("en-CA")}
                      </div>
                      <div className="col-span-2 text-sm text-body text-right">{formatCurrency(app.bill.total_amount)}</div>
                      <div className="col-span-2 text-sm font-medium text-amber-600 dark:text-amber-400 text-right">{formatCurrency(app.bill.balance)}</div>
                      <div className="col-span-2">
                        <input
                          type="number" min="0" step="0.01"
                          max={app.bill.balance}
                          placeholder="0.00"
                          value={app.amount}
                          onChange={(e) => updateApplicationAmount(idx, e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-right text-heading ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 transition-all hover:ring-gray-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-t border-edge">
                  <div className="flex justify-end gap-6 text-sm">
                    <div>
                      <span className="text-muted">Applied: </span>
                      <span className="font-bold text-heading">${totalApplied.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted">Unapplied: </span>
                      <span className={`font-bold ${unapplied > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600"}`}>
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
            {loading ? "Recording..." : "Record Bill Payment"}
          </button>
          <Link href="/bills" className="flex items-center justify-center rounded-xl border-2 border-edge bg-surface px-6 py-3 text-sm font-bold text-body shadow-sm hover:bg-surface-hover transition-all">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewBillPaymentPage() {
  const { loading: authLoading } = useAuth();

  if (authLoading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-secondary relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="Record Bill Payment"
        subtitle="Pay a vendor bill"
        actions={
          <Link href="/bills" className="group inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2 text-sm font-bold text-body shadow-sm hover:bg-surface-hover transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Bills
          </Link>
        }
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Suspense fallback={<PageLoader />}>
          <NewBillPaymentForm />
        </Suspense>
      </div>
    </div>
  );
}
