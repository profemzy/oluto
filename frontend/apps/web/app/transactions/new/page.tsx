"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user?.business_id) return;

    setLoading(true);

    try {
      const signedAmount = txnType === "expense" ? `-${amount}` : amount;
      await api.createTransaction(user.business_id, {
        vendor_name: vendorName,
        amount: signedAmount,
        transaction_date: transactionDate,
        category: category || undefined,
        description: description || undefined,
        source_device: "web",
        ai_suggested_category: aiSuggestion?.category,
        ai_confidence: aiSuggestion?.confidence,
      });
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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <PageHeader
        title="Add Transaction"
        subtitle="Record a new financial transaction"
        actions={
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Transactions
          </Link>
        }
      />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white py-8 px-4 shadow-lg shadow-gray-900/5 rounded-xl border border-gray-200 sm:px-10">
          <ErrorAlert error={error} className="mb-6" />

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Transaction Type Toggle */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-0 rounded-lg ring-1 ring-inset ring-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTxnType("expense")}
                  className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                    txnType === "expense"
                      ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                      : "bg-white text-gray-500 hover:bg-gray-50"
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
                    setAiSuggestion(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                    txnType === "income"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-white text-gray-500 hover:bg-gray-50"
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
              <label htmlFor="vendorName" className="block text-sm font-medium leading-6 text-gray-900">
                Vendor / Payee
              </label>
              <div className="mt-2">
                <input
                  id="vendorName"
                  name="vendorName"
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Staples, Tim Hortons"
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">
                  Amount (CAD)
                </label>
                <div className="mt-2 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className={`text-sm font-medium ${
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
                    className={`block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                      txnType === "expense"
                        ? "text-red-700 ring-red-200 focus:ring-red-500"
                        : "text-emerald-700 ring-emerald-200 focus:ring-emerald-500"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="transactionDate" className="block text-sm font-medium leading-6 text-gray-900">
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
                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                Description
                <span className="text-gray-400 font-normal"> (optional — helps AI pick the right category)</span>
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Ink cartridges for office printer, team lunch..."
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
                Category
                <span className="text-gray-400 font-normal"> (optional)</span>
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
                  className={`block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                    aiSuggestion && category === aiSuggestion.category
                      ? "ring-cyan-300 focus:ring-cyan-500"
                      : "ring-gray-300 focus:ring-cyan-600"
                  }`}
                >
                  <option value="">Select CRA category...</option>
                  {CRA_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {suggestingCategory && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-cyan-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
              {aiSuggestion ? (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700 ring-1 ring-inset ring-cyan-300">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI suggested
                    {aiSuggestion.confidence >= 0.8 ? " — high confidence" : ""}
                  </span>
                  {aiSuggestion.reasoning && (
                    <span className="text-xs text-gray-500">{aiSuggestion.reasoning}</span>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Based on CRA T2125 expense categories
                </p>
              )}
            </div>

            <div className="rounded-lg bg-cyan-50 border border-cyan-200 p-4">
              <p className="text-sm text-cyan-800">
                Tax (GST/HST/PST) will be automatically calculated based on your business province.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Transaction"}
              </button>
              <Link
                href="/transactions"
                className="flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
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
