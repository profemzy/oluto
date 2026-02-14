"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert, ReceiptUploadSection } from "@/app/components";
import type { PendingReceiptFile, OcrSuggestion } from "@/app/components";
import { CRA_CATEGORIES } from "@/app/lib/constants";

export default function NewTransactionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [vendorName, setVendorName] = useState("");
  const [txnType, setTxnType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [taxTreatment, setTaxTreatment] = useState<"standard" | "gst_only" | "exempt" | "custom">("standard");
  const [gstAmount, setGstAmount] = useState("");
  const [pstAmount, setPstAmount] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    confidence: number;
    reasoning: string | null;
  } | null>(null);
  const [suggestingCategory, setSuggestingCategory] = useState(false);
  const manualCategoryRef = useRef(false);
  const prevVendorRef = useRef("");
  const prevDescriptionRef = useRef("");

  // Debounced AI category suggestion for expenses
  // Two-phase: fast on vendor change (600ms), slower on description refinement (1200ms)
  useEffect(() => {
    const trimmedVendor = vendorName.trim().toLowerCase();
    const isVendorChange = trimmedVendor !== prevVendorRef.current;
    const isDescriptionChange = description !== prevDescriptionRef.current;

    // Update refs for next comparison
    prevVendorRef.current = trimmedVendor;
    prevDescriptionRef.current = description;

    if (
      txnType !== "expense" ||
      vendorName.trim().length < 3 ||
      !user?.business_id
    ) {
      setAiSuggestion(null);
      return;
    }

    if (isVendorChange) {
      // New vendor — reset manual override so AI can auto-fill
      manualCategoryRef.current = false;
    } else if (isDescriptionChange) {
      // Description refinement — only fire if substantive and not manually overridden
      if (!description || description.trim().length < 5) return;
      if (manualCategoryRef.current) return;
    } else {
      // Nothing relevant changed
      return;
    }

    const debounceMs = isVendorChange ? 600 : 1200;

    const timer = setTimeout(async () => {
      setSuggestingCategory(true);
      try {
        const suggestion = await api.suggestCategory(user.business_id!, {
          vendor_name: vendorName.trim(),
          amount: amount || undefined,
          description: description || undefined,
        });

        if (suggestion.confidence >= 0.5) {
          setAiSuggestion(suggestion);
          // Only auto-fill if user hasn't manually selected a category
          if (!manualCategoryRef.current) {
            setCategory(suggestion.category);
          }
        } else {
          setAiSuggestion(null);
        }
      } catch {
        // Silently fail — AI suggestion is optional
        setAiSuggestion(null);
      } finally {
        setSuggestingCategory(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [vendorName, txnType, user?.business_id, description]); // eslint-disable-line react-hooks/exhaustive-deps

  // Receipt upload state (pending mode — files collected before txn exists)
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceiptFile[]>([]);

  const handleOcrSuggestion = useCallback((suggestion: OcrSuggestion) => {
    if (suggestion.vendor && !vendorName) setVendorName(suggestion.vendor);
    if (suggestion.amount && !amount) setAmount(suggestion.amount);
    if (suggestion.date && !transactionDate) setTransactionDate(suggestion.date);
    if (suggestion.gstAmount || suggestion.pstAmount) {
      if (!gstAmount && !pstAmount) {
        setTaxTreatment("custom");
        if (suggestion.gstAmount) setGstAmount(suggestion.gstAmount);
        if (suggestion.pstAmount) setPstAmount(suggestion.pstAmount);
      }
    }
  }, [vendorName, amount, transactionDate, gstAmount, pstAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user?.business_id) return;

    setLoading(true);

    try {
      const signedAmount = txnType === "expense" ? `-${amount}` : amount;

      // Determine tax overrides based on treatment selection (expenses only)
      let gstOverride: string | undefined;
      let pstOverride: string | undefined;
      if (txnType === "expense") {
        if (taxTreatment === "exempt") {
          gstOverride = "0";
          pstOverride = "0";
        } else if (taxTreatment === "gst_only") {
          // Auto-calculate GST, but force PST to zero
          pstOverride = "0";
        } else if (taxTreatment === "custom") {
          gstOverride = gstAmount || "0";
          pstOverride = pstAmount || "0";
        }
        // "standard" → omit both, backend auto-calculates
      }

      const txn = await api.createTransaction(user.business_id, {
        vendor_name: vendorName,
        amount: signedAmount,
        transaction_date: transactionDate,
        category: category || undefined,
        description: description || undefined,
        source_device: "web",
        ai_suggested_category: aiSuggestion?.category,
        ai_confidence: aiSuggestion?.confidence,
        gst_amount: gstOverride,
        pst_amount: pstOverride,
      });

      // Upload pending receipts (non-blocking — failures don't prevent navigation)
      if (pendingReceipts.length > 0) {
        await Promise.allSettled(
          pendingReceipts.map((pr) =>
            api.uploadReceipt(user.business_id!, txn.id, pr.file, pr.runOcr)
          )
        );
      }

      router.push("/transactions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-secondary relative">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 dark:bg-cyan-800 rounded-full opacity-20 blur-2xl animate-float" />
      <div className="absolute bottom-40 left-10 w-32 h-32 bg-green-200 dark:bg-green-800 rounded-full opacity-20 blur-3xl animate-float-slow" />

      <PageHeader
        title="Add Transaction"
        subtitle="Record a new financial transaction"
        actions={
          <Link
            href="/transactions"
            className="group inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2 text-sm font-bold text-body shadow-sm hover:bg-surface-hover hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Transactions
          </Link>
        }
      />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-surface/90 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-gray-900/5 rounded-2xl border border-edge-subtle sm:px-10">
          <ErrorAlert error={error} className="mb-6" />

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Transaction Type Toggle */}
            <div>
              <label className="block text-sm font-bold leading-6 text-heading mb-2">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-0 rounded-xl ring-1 ring-inset ring-[var(--color-ring-default)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTxnType("expense")}
                  className={`flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all duration-200 ${
                    txnType === "expense"
                      ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 ring-1 ring-red-200"
                      : "bg-surface text-muted hover:bg-surface-hover"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxnType("income");
                    setCategory("");
                    setAiSuggestion(null);
                    setTaxTreatment("standard");
                    setGstAmount("");
                    setPstAmount("");
                  }}
                  className={`flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all duration-200 ${
                    txnType === "income"
                      ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-surface text-muted hover:bg-surface-hover"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  Income
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="vendorName" className="block text-sm font-bold leading-6 text-heading">
                {txnType === "expense" ? "Vendor / Payee" : "Client / Payer"}
              </label>
              <div className="mt-2">
                <input
                  id="vendorName"
                  name="vendorName"
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder={txnType === "expense" ? "e.g. Staples, Tim Hortons" : "e.g. Client name, Company Inc."}
                  className="block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] placeholder:text-caption focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6 transition-all duration-200 hover:ring-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-bold leading-6 text-heading">
                  Amount (CAD)
                </label>
                <div className="mt-2 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className={`text-sm font-bold ${
                      txnType === "expense" ? "text-red-500" : "text-emerald-500"
                    }`}>
                      {txnType === "expense" ? "−$" : "+$"}
                    </span>
                  </div>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`block w-full rounded-xl border-0 py-3 pl-12 pr-4 shadow-sm ring-1 ring-inset placeholder:text-caption focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all duration-200 hover:ring-gray-400 ${
                      txnType === "expense"
                        ? "text-red-700 ring-red-200 focus:ring-red-500"
                        : "text-emerald-700 ring-emerald-200 focus:ring-emerald-500"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="transactionDate" className="block text-sm font-bold leading-6 text-heading">
                  Date
                </label>
                <div className="mt-2">
                  <input
                    id="transactionDate"
                    name="transactionDate"
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] placeholder:text-caption focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6 transition-all duration-200 hover:ring-gray-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold leading-6 text-heading">
                Description
                <span className="text-caption font-normal"> (optional — helps AI pick the right category)</span>
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Ink cartridges for office printer, team lunch..."
                  className="block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] placeholder:text-caption focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6 transition-all duration-200 hover:ring-gray-400 resize-none"
                />
              </div>
            </div>

            {txnType === "expense" && user?.business_id && (
              <ReceiptUploadSection
                businessId={user.business_id}
                transactionId={null}
                onPendingFilesChange={setPendingReceipts}
                onOcrResult={handleOcrSuggestion}
                defaultRunOcr={true}
              />
            )}

            {txnType === "expense" && (
            <div>
              <label htmlFor="category" className="block text-sm font-bold leading-6 text-heading">
                Category
                <span className="text-caption font-normal"> (optional)</span>
              </label>
              <div className="mt-2 relative">
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    manualCategoryRef.current = true;
                  }}
                  className={`block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all duration-200 hover:ring-gray-400 bg-surface ${
                    aiSuggestion && category === aiSuggestion.category
                      ? "ring-cyan-300 focus:ring-cyan-500"
                      : "ring-[var(--color-ring-default)] focus:ring-cyan-600"
                  }`}
                >
                  <option value="">Select CRA category...</option>
                  {CRA_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {suggestingCategory && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
              {aiSuggestion ? (
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-50 to-teal-50 px-3 py-1.5 text-xs font-bold text-cyan-700 ring-1 ring-inset ring-cyan-200">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI suggested
                    {aiSuggestion.confidence >= 0.8 ? " — high confidence" : ""}
                  </span>
                  {aiSuggestion.reasoning && (
                    <span className="text-xs text-muted">{aiSuggestion.reasoning}</span>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted">
                  Based on CRA T2125 expense categories
                </p>
              )}
            </div>
            )}

            {txnType === "expense" ? (
            <div>
              <label className="block text-sm font-bold leading-6 text-heading mb-2">
                Tax Treatment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {([
                  { value: "standard", label: "Standard Rate", desc: "Auto-calc GST+PST" },
                  { value: "gst_only", label: "GST Only", desc: "No provincial tax" },
                  { value: "exempt", label: "No Tax", desc: "Zero-rated / exempt" },
                  { value: "custom", label: "From Receipt", desc: "Enter exact amounts" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setTaxTreatment(opt.value);
                      if (opt.value !== "custom") {
                        setGstAmount("");
                        setPstAmount("");
                      }
                    }}
                    className={`rounded-xl p-3 text-left transition-all duration-200 border ${
                      taxTreatment === opt.value
                        ? "bg-cyan-50 dark:bg-cyan-950 border-cyan-300 ring-1 ring-cyan-200"
                        : "bg-surface border-edge hover:border-edge"
                    }`}
                  >
                    <p className={`text-xs font-bold ${taxTreatment === opt.value ? "text-cyan-700" : "text-body"}`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {taxTreatment === "custom" && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label htmlFor="gstAmount" className="block text-xs font-semibold text-body mb-1">
                      GST/HST Amount
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-xs text-caption">$</span>
                      </div>
                      <input
                        id="gstAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={gstAmount}
                        onChange={(e) => setGstAmount(e.target.value)}
                        placeholder="0.00"
                        className="block w-full rounded-lg border-0 py-2 pl-7 pr-3 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] placeholder:text-caption focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="pstAmount" className="block text-xs font-semibold text-body mb-1">
                      PST/QST Amount
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-xs text-caption">$</span>
                      </div>
                      <input
                        id="pstAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={pstAmount}
                        onChange={(e) => setPstAmount(e.target.value)}
                        placeholder="0.00"
                        className="block w-full rounded-lg border-0 py-2 pl-7 pr-3 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] placeholder:text-caption focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {taxTreatment !== "custom" && (
                <p className="mt-2 text-xs text-muted">
                  {taxTreatment === "standard" && "GST/HST and PST will be auto-calculated from your business province."}
                  {taxTreatment === "gst_only" && "Only federal GST will be calculated. PST will be $0."}
                  {taxTreatment === "exempt" && "No tax will be claimed as ITC for this purchase."}
                </p>
              )}
            </div>
            ) : (
            <div className="rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-cyan-800">
                  Tax (GST/HST/PST) will be automatically calculated based on your business province.
                </p>
              </div>
            </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 px-3 py-3 text-sm font-bold leading-6 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 btn-glow"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Transaction"
                )}
              </button>
              <Link
                href="/transactions"
                className="flex items-center justify-center rounded-xl border-2 border-edge bg-surface px-6 py-3 text-sm font-bold text-body shadow-sm hover:bg-surface-hover hover:border-edge hover:-translate-y-0.5 transition-all duration-200"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
