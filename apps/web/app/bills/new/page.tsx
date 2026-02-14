"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, Contact, Account, CreateBillLineItemRequest, ReceiptOcrData } from "@/app/lib/api";
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
    if (!user?.business_id) return;
    const load = async () => {
      try {
        const [vends, accts] = await Promise.all([
          api.getVendors(user.business_id!),
          api.listAccounts(user.business_id!),
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
  }, [user?.business_id]);

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

  const handleOcrDataExtracted = (ocrData: ReceiptOcrData) => {
    // Auto-fill amount in first line item if OCR extracted an amount
    if (ocrData.amount) {
      const parsedAmount = parseFloat(ocrData.amount);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        setLineItems((prev) => {
          const updated = [...prev];
          updated[0] = { ...updated[0], amount: parsedAmount.toFixed(2) };
          return updated;
        });
      }
    }

    // Auto-fill bill date if OCR extracted a date
    if (ocrData.date) {
      try {
        const parsedDate = new Date(ocrData.date);
        if (!isNaN(parsedDate.getTime())) {
          setBillDate(parsedDate.toISOString().slice(0, 10));
        }
      } catch (err) {
        console.error("Failed to parse OCR date:", err);
      }
    }

    // Try to match vendor by name if OCR extracted vendor info
    if (ocrData.vendor && vendors.length > 0) {
      const matchedVendor = vendors.find((v) =>
        v.name.toLowerCase().includes(ocrData.vendor!.toLowerCase()) ||
        ocrData.vendor!.toLowerCase().includes(v.name.toLowerCase())
      );
      if (matchedVendor) {
        setVendorId(matchedVendor.id);
      }
    }

    // Add raw text to memo if available
    if (ocrData.raw_text) {
      const excerpt = ocrData.raw_text.substring(0, 200);
      setMemo(`OCR Extract: ${excerpt}${ocrData.raw_text.length > 200 ? "..." : ""}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!user?.business_id) return;

    try {
      const result = await api.createBill(user.business_id!, {
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

      // Upload pending receipts/invoices (wait for completion before navigation)
      if (pendingReceipts.length > 0) {
        try {
          await Promise.all(
            pendingReceipts.map((pr) =>
              api.uploadBillReceipt(user.business_id!, result.id, pr.file, pr.runOcr)
            )
          );
        } catch (uploadErr) {
          console.error("Receipt upload failed:", uploadErr);
          // Bill was created successfully, but receipts failed to upload
          // Show warning but still navigate - user can attach receipts later
          setError(
            "Bill created successfully, but some receipts failed to upload. You can attach them from the bill detail page."
          );
          // Brief delay to show error message before navigating
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      router.push("/bills");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || dataLoading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-secondary relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="New Bill"
        subtitle="Record a bill from a vendor"
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
        <div className="bg-surface/90 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-gray-900/5 rounded-2xl border border-edge-subtle sm:px-10">
          <ErrorAlert error={error} className="mb-6" />
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Header Fields */}
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
                <label htmlFor="billNumber" className="block text-sm font-bold leading-6 text-heading">Bill Number <span className="text-caption font-normal">(optional)</span></label>
                <input id="billNumber" type="text" value={billNumber} onChange={(e) => setBillNumber(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
              <div>
                <label htmlFor="billDate" className="block text-sm font-bold leading-6 text-heading">Bill Date</label>
                <input id="billDate" type="date" required value={billDate} onChange={(e) => setBillDate(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-bold leading-6 text-heading">Due Date</label>
                <input id="dueDate" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="memo" className="block text-sm font-bold leading-6 text-heading">Memo <span className="text-caption font-normal">(optional)</span></label>
              <textarea id="memo" rows={2} value={memo} onChange={(e) => setMemo(e.target.value)}
                className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400 resize-none" />
            </div>

            {/* Receipt/Invoice Upload */}
            {user?.business_id && (
              <BillReceiptSection
                businessId={user.business_id}
                billId={null}
                onPendingFilesChange={setPendingReceipts}
                onOcrDataExtracted={handleOcrDataExtracted}
                defaultRunOcr={false}
              />
            )}

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-heading">Line Items</h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950 px-3 py-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Line
                </button>
              </div>

              <div className="border border-edge rounded-xl overflow-hidden">
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-4 py-3 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge text-xs font-bold text-muted uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-4">Expense Account</div>
                  <div className="col-span-1"></div>
                </div>
                <div className="divide-y divide-edge-subtle">
                  {lineItems.map((item, idx) => (
                    <div key={item._key} className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 items-center">
                      <div className="col-span-1 text-sm text-muted font-medium hidden sm:block">{idx + 1}</div>
                      <div className="col-span-4">
                        <input
                          type="text" placeholder="Description"
                          value={item.description || ""} onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-heading ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 transition-all hover:ring-gray-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number" required min="0" step="0.01" placeholder="0.00"
                          value={item.amount} onChange={(e) => updateLineItem(idx, "amount", e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-heading ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 transition-all hover:ring-gray-400"
                        />
                      </div>
                      <div className="col-span-4">
                        <select
                          required value={item.expense_account_id} onChange={(e) => updateLineItem(idx, "expense_account_id", e.target.value)}
                          className="block w-full rounded-lg border-0 py-2 px-3 text-sm text-heading ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 bg-surface transition-all hover:ring-gray-400"
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
                          className="p-1.5 rounded-lg text-caption hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                <div className="w-64 bg-gradient-to-r from-surface-secondary to-surface-tertiary rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-body">Total</span>
                    <span className="font-bold text-heading">${total.toFixed(2)}</span>
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
              <Link href="/bills" className="flex items-center justify-center rounded-xl border-2 border-edge bg-surface px-6 py-3 text-sm font-bold text-body shadow-sm hover:bg-surface-hover transition-all">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
