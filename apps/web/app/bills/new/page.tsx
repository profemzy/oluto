"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, Contact, Account, CreateBillLineItemRequest } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert, BillReceiptSection, PendingReceiptFile } from "@/app/components";

interface LineItemRow extends CreateBillLineItemRequest {
  _key: number;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function plus30(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

let nextKey = 1;
const emptyLine = (): LineItemRow => ({
  _key: nextKey++,
  line_number: 1,
  description: "",
  amount: "",
  expense_account_id: "",
});

export default function NewBillPage() {
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [vendors, setVendors] = useState<Contact[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<Account[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [billNumber, setBillNumber] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [billDate, setBillDate] = useState(todayStr());
  const [dueDate, setDueDate] = useState(plus30());
  const [memo, setMemo] = useState("");
  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyLine()]);
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceiptFile[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [vends, accts] = await Promise.all([
          api.getVendors(),
          api.listAccounts(),
        ]);
        setVendors(vends);
        setExpenseAccounts(accts.filter((a) => a.account_type === "Expense" && a.is_active));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []);

  const updateLineItem = (index: number, field: keyof LineItemRow, value: string) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
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

  const total = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!user?.business_id) return;

    try {
      const result = await api.createBill({
        bill_number: billNumber || undefined,
        vendor_id: vendorId,
        bill_date: billDate,
        due_date: dueDate,
        memo: memo || undefined,
        line_items: lineItems.map((item) => ({
          line_number: item.line_number,
          description: item.description || undefined,
          amount: item.amount,
          expense_account_id: item.expense_account_id,
        })),
      });

      // Upload pending receipts/invoices (non-blocking — failures don't prevent navigation)
      if (pendingReceipts.length > 0) {
        await Promise.allSettled(
          pendingReceipts.map((pr) =>
            api.uploadBillReceipt(user.business_id!, result.id, pr.file, pr.runOcr)
          )
        );
      }

      router.push(`/bills/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || dataLoading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="New Bill"
        subtitle="Record a bill from a vendor"
        actions={
          <Link href="/bills" className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Bills
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
                <label htmlFor="vendorId" className="block text-sm font-bold leading-6 text-gray-900">Vendor</label>
                <select id="vendorId" required value={vendorId} onChange={(e) => setVendorId(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm bg-white transition-all hover:ring-gray-400">
                  <option value="">Select a vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="billNumber" className="block text-sm font-bold leading-6 text-gray-900">Bill Number <span className="text-gray-400 font-normal">(optional)</span></label>
                <input id="billNumber" type="text" value={billNumber} onChange={(e) => setBillNumber(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
              <div>
                <label htmlFor="billDate" className="block text-sm font-bold leading-6 text-gray-900">Bill Date</label>
                <input id="billDate" type="date" required value={billDate} onChange={(e) => setBillDate(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-bold leading-6 text-gray-900">Due Date</label>
                <input id="dueDate" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="memo" className="block text-sm font-bold leading-6 text-gray-900">Memo <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea id="memo" rows={2} value={memo} onChange={(e) => setMemo(e.target.value)}
                className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400 resize-none" />
            </div>

            {/* Receipt/Invoice Upload */}
            {user?.business_id && (
              <BillReceiptSection
                businessId={user.business_id}
                billId={null}
                onPendingFilesChange={setPendingReceipts}
                defaultRunOcr={false}
              />
            )}

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
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-4">Expense Account</div>
                  <div className="col-span-1"></div>
                </div>
                <div className="divide-y divide-gray-100">
                  {lineItems.map((item, idx) => (
                    <div key={item._key} className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 items-center">
                      <div className="col-span-1 text-sm text-gray-500 font-medium hidden sm:block">{idx + 1}</div>
                      <div className="col-span-4">
                        <input
                          type="text" placeholder="Description"
                          value={item.description || ""} onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 transition-all hover:ring-gray-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number" required min="0" step="0.01" placeholder="0.00"
                          value={item.amount} onChange={(e) => updateLineItem(idx, "amount", e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 transition-all hover:ring-gray-400"
                        />
                      </div>
                      <div className="col-span-4">
                        <select
                          required value={item.expense_account_id} onChange={(e) => updateLineItem(idx, "expense_account_id", e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 bg-white transition-all hover:ring-gray-400"
                        >
                          <option value="">Select account</option>
                          {expenseAccounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
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

              {/* Total */}
              <div className="mt-4 flex justify-end">
                <div className="w-64 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-700">Total</span>
                    <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 flex justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-glow">
                {loading ? "Creating..." : "Create Bill"}
              </button>
              <Link href="/bills" className="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
