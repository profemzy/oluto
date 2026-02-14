"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  api,
  ParsedTransaction,
  ImportParseResponse,
  AsyncJobCreateResponse,
  AsyncJobStatusResponse,
} from "@/app/lib/api";
import { formatCurrency, formatDate } from "@/app/lib/format";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";
import { CRA_CATEGORIES, CLASSIFICATION_OPTIONS } from "@/app/lib/constants";

type ImportStep = "upload" | "processing" | "preview" | "success";

export default function ImportTransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<ImportStep>("upload");
  const [error, setError] = useState("");
  const [parseResult, setParseResult] = useState<ImportParseResponse | null>(
    null
  );
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [editedTransactions, setEditedTransactions] = useState<
    ParsedTransaction[]
  >([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [skippedDuplicates, setSkippedDuplicates] = useState(0);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobMessage, setJobMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const handleParseResult = useCallback((result: ImportParseResponse) => {
    setParseResult(result);
    setEditedTransactions([...result.transactions]);

    // Select all non-duplicate rows by default
    const selected = new Set<number>();
    result.transactions.forEach((t: ParsedTransaction, i: number) => {
      if (!t.is_duplicate) {
        selected.add(i);
      }
    });
    setSelectedRows(selected);
    setStep("preview");
  }, []);

  const pollJobStatus = useCallback(
    (businessId: string, jobId: number) => {
      setJobProgress(0);
      setJobMessage("Queued for processing...");

      pollingRef.current = setInterval(async () => {
        try {
          const status: AsyncJobStatusResponse = await api.getJobStatus(
            businessId,
            jobId
          );

          setJobProgress(status.progress);
          setJobMessage(status.progress_message || "Processing...");

          if (status.status === "completed" && status.result_data) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            handleParseResult(status.result_data as ImportParseResponse);
          } else if (status.status === "failed") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setError(
              status.error_message || "PDF processing failed. Please try again."
            );
            setStep("upload");
          }
        } catch (err) {
          // Don't stop polling on transient network errors
          console.error("Poll error:", err);
        }
      }, 2000); // Poll every 2 seconds
    },
    [handleParseResult]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError("");

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "csv" && ext !== "pdf") {
        setError("Please upload a .csv or .pdf file.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File too large. Maximum size is 10 MB.");
        return;
      }

      if (!user?.business_id) return;

      setStep("processing");
      setJobProgress(0);
      setJobMessage(
        ext === "pdf"
          ? "Uploading PDF for OCR processing..."
          : "Parsing CSV..."
      );

      try {
        const result = await api.parseImportFile(user.business_id, file);

        // Check if this is an async job response (PDF) or direct result (CSV)
        if ("job_id" in result) {
          // PDF: start polling for job completion
          const jobResult = result as AsyncJobCreateResponse;
          setJobMessage("PDF queued for OCR processing...");
          pollJobStatus(user.business_id, jobResult.job_id);
        } else {
          // CSV: direct result
          handleParseResult(result as ImportParseResponse);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to parse file"
        );
        setStep("upload");
      }
    },
    [user, pollJobStatus, handleParseResult]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const toggleRow = (index: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set<number>();
    editedTransactions.forEach((_, i) => all.add(i));
    setSelectedRows(all);
  };

  const deselectDuplicates = () => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      editedTransactions.forEach((t, i) => {
        if (t.is_duplicate) {
          next.delete(i);
        }
      });
      return next;
    });
  };

  const updateTransaction = (
    index: number,
    field: keyof ParsedTransaction,
    value: string
  ) => {
    setEditedTransactions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleConfirm = async () => {
    if (!user?.business_id || !parseResult) return;

    setImporting(true);
    setError("");

    const selected = editedTransactions.filter((_, i) =>
      selectedRows.has(i)
    );

    try {
      const result = await api.confirmImport(user.business_id, {
        file_type: parseResult.file_type,
        transactions: selected.map((t) => ({
          transaction_date: t.transaction_date,
          vendor_name: t.vendor_name,
          amount: t.amount,
          description: t.description || undefined,
          category: t.category || undefined,
          classification: t.classification || undefined,
          ai_suggested_category:
            t.ai_confidence > 0 ? t.category || undefined : undefined,
          ai_confidence: t.ai_confidence || undefined,
        })),
      });
      setImportedCount(result.imported_count);
      setSkippedDuplicates(result.skipped_duplicates);
      setBatchId(result.batch_id);
      setStep("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to import transactions"
      );
    } finally {
      setImporting(false);
    }
  };

  const handlePostAll = async () => {
    if (!user?.business_id || !batchId) return;

    setPosting(true);
    setError("");

    try {
      await api.bulkUpdateStatus(user.business_id, {
        batch_id: batchId,
        status: "posted",
      });
      setPosted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to post transactions"
      );
    } finally {
      setPosting(false);
    }
  };

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <div className="absolute bottom-40 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-3xl animate-float-slow" />

      <PageHeader
        title="Import Transactions"
        subtitle="Upload a bank or credit card statement"
        actions={
          <Link
            href="/transactions"
            className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Transactions
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />

        {/* Step: Upload */}
        {step === "upload" && (
          <div className="max-w-2xl mx-auto">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
                dragActive
                  ? "border-cyan-500 bg-cyan-50 scale-[1.02] shadow-lg shadow-cyan-500/20"
                  : "border-gray-300 bg-white hover:border-cyan-400 hover:bg-gray-50 hover:shadow-lg"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.pdf"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {dragActive
                  ? "Drop your file here"
                  : "Drag & drop your statement"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                or click to browse files
              </p>

              <div className="flex items-center justify-center gap-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  CSV
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-50 to-rose-100 px-4 py-2 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  PDF
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Maximum file size: 10 MB
              </p>
            </div>

            <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Supported formats
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  CSV exports from most Canadian banks (BMO, TD, RBC,
                  Scotiabank)
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  PDF bank and credit card statements (uses AI-powered OCR)
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Credit card statements with CR-suffixed credits
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="relative mx-auto w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-100" />
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Processing your statement...
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {jobMessage || "This may take a moment for PDF files using OCR."}
            </p>

            {/* Progress bar */}
            {jobProgress > 0 && (
              <div className="w-full max-w-xs mx-auto">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="font-bold">{jobProgress}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${jobProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Preview */}
        {step === "preview" && parseResult && (
          <div>
            {/* File info banner */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      parseResult.file_type === "csv"
                        ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                        : "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 ring-1 ring-rose-200"
                    }`}
                  >
                    {parseResult.file_type.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {parseResult.file_name}
                  </span>
                  {parseResult.statement_period && (
                    <span className="text-sm text-gray-500">
                      {parseResult.statement_period}
                    </span>
                  )}
                  {parseResult.account_info && (
                    <span className="text-sm text-gray-500">
                      &middot; {parseResult.account_info}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-500">
                  {parseResult.total_count} transaction
                  {parseResult.total_count === 1 ? "" : "s"} found
                </span>
              </div>
            </div>

            {/* Warnings */}
            {parseResult.parse_warnings.length > 0 && (
              <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <h4 className="text-sm font-bold text-amber-800 mb-2">
                  Parse warnings
                </h4>
                <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
                  {parseResult.parse_warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI categorization banner */}
            {(() => {
              const aiCount = editedTransactions.filter(
                (t) => t.ai_confidence > 0
              ).length;
              return aiCount > 0 ? (
                <div className="mb-6 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 p-4 flex items-center gap-3">
                  <svg
                    className="h-6 w-6 text-cyan-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <p className="text-sm text-cyan-800">
                    AI has suggested categories for{" "}
                    <strong>{aiCount}</strong> transaction
                    {aiCount === 1 ? "" : "s"}. Review and adjust as
                    needed.
                  </p>
                </div>
              ) : null;
            })()}

            {/* Duplicates warning */}
            {parseResult.duplicate_count > 0 && (
              <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    {parseResult.duplicate_count} potential duplicate
                    {parseResult.duplicate_count === 1 ? "" : "s"} detected
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    These match existing transactions and have been
                    deselected.
                  </p>
                </div>
                <button
                  onClick={deselectDuplicates}
                  className="text-sm font-bold text-amber-700 hover:text-amber-800 hover:underline transition-all"
                >
                  Deselect duplicates
                </button>
              </div>
            )}

            {/* Action bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={selectAll}
                  className="text-sm font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
                >
                  Select all
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setSelectedRows(new Set())}
                  className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Deselect all
                </button>
              </div>
              <p className="text-sm font-bold text-gray-500">
                <span className="text-cyan-600">{selectedRows.size}</span> of {editedTransactions.length} selected
              </p>
            </div>

            {/* Transactions table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Category
                      </th>
                      <th className="px-4 py-3 w-10">
                        <span className="sr-only">Status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {editedTransactions.map((txn, index) => (
                      <tr
                        key={index}
                        className={`${
                          selectedRows.has(index) ? "bg-white" : "bg-gray-50 opacity-60"
                        } hover:bg-cyan-50/50 transition-colors`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(index)}
                            onChange={() => toggleRow(index)}
                            className="h-4 w-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(txn.transaction_date)}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={txn.vendor_name}
                            onChange={(e) =>
                              updateTransaction(
                                index,
                                "vendor_name",
                                e.target.value
                              )
                            }
                            className="w-full text-sm text-gray-900 border-0 bg-transparent focus:ring-1 focus:ring-cyan-500 rounded-lg px-2 py-1 -mx-1 hover:bg-white"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span
                            className={`text-sm font-bold ${
                              parseFloat(txn.amount) < 0
                                ? "text-red-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {formatCurrency(txn.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {(() => {
                            const isCredit = parseFloat(txn.amount) >= 0;
                            const options = isCredit ? CLASSIFICATION_OPTIONS.credit : CLASSIFICATION_OPTIONS.debit;
                            return (
                              <select
                                value={txn.classification || (isCredit ? "business_income" : "business_expense")}
                                onChange={(e) =>
                                  updateTransaction(
                                    index,
                                    "classification",
                                    e.target.value
                                  )
                                }
                                className={`text-sm border-0 bg-transparent focus:ring-1 focus:ring-cyan-500 rounded-lg px-2 py-1 -mx-1 max-w-[180px] hover:bg-white cursor-pointer font-medium ${
                                  (txn.classification || (isCredit ? "business_income" : "business_expense")) === "personal"
                                    ? "text-gray-400"
                                    : (txn.classification || "").startsWith("transfer") || (txn.classification || "") === "owner_contribution" || (txn.classification || "") === "owner_draw" || (txn.classification || "") === "refund"
                                    ? "text-purple-600"
                                    : "text-gray-700"
                                }`}
                              >
                                {options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={txn.category || ""}
                              onChange={(e) =>
                                updateTransaction(
                                  index,
                                  "category",
                                  e.target.value
                                )
                              }
                              className="text-sm text-gray-700 border-0 bg-transparent focus:ring-1 focus:ring-cyan-500 rounded-lg px-2 py-1 -mx-1 max-w-[200px] hover:bg-white cursor-pointer"
                            >
                              <option value="">—</option>
                              {CRA_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            {txn.ai_confidence >= 0.8 && (
                              <span className="inline-flex items-center rounded-md bg-gradient-to-r from-emerald-50 to-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-300">
                                AI
                              </span>
                            )}
                            {txn.ai_confidence >= 0.5 &&
                              txn.ai_confidence < 0.8 && (
                                <span className="inline-flex items-center rounded-md bg-gradient-to-r from-amber-50 to-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-300">
                                  AI?
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {txn.is_duplicate && (
                            <span
                              title="Potential duplicate"
                              className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700"
                            >
                              Dup
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Classification summary */}
            {selectedRows.size > 0 && (() => {
              const selected = editedTransactions.filter((_, i) => selectedRows.has(i));
              const incomeCount = selected.filter((t) => (t.classification || (parseFloat(t.amount) >= 0 ? "business_income" : "business_expense")) === "business_income").length;
              const expenseCount = selected.filter((t) => (t.classification || (parseFloat(t.amount) >= 0 ? "business_income" : "business_expense")) === "business_expense").length;
              const otherCount = selected.length - incomeCount - expenseCount;
              return (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                  <div className="flex items-center gap-6 text-sm">
                    <span className="font-bold text-gray-700">Import summary:</span>
                    {incomeCount > 0 && (
                      <span className="text-emerald-600 font-medium">{incomeCount} income</span>
                    )}
                    {expenseCount > 0 && (
                      <span className="text-red-500 font-medium">{expenseCount} expense{expenseCount !== 1 ? "s" : ""}</span>
                    )}
                    {otherCount > 0 && (
                      <span className="text-purple-600 font-medium">{otherCount} other (non-P&L)</span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Confirm actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <button
                onClick={() => {
                  if (pollingRef.current) clearInterval(pollingRef.current);
                  setStep("upload");
                  setParseResult(null);
                  setEditedTransactions([]);
                  setSelectedRows(new Set());
                  setJobProgress(0);
                  setJobMessage("");
                  setError("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200"
              >
                Upload different file
              </button>
              <button
                onClick={handleConfirm}
                disabled={importing || selectedRows.size === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {importing
                  ? "Importing..."
                  : `Import ${selectedRows.size} Transaction${selectedRows.size === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Import complete!
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Successfully imported {importedCount} transaction
              {importedCount === 1 ? "" : "s"} as drafts.
            </p>
            {skippedDuplicates > 0 && (
              <p className="text-sm text-amber-600 font-bold mb-6">
                Skipped {skippedDuplicates} duplicate transaction
                {skippedDuplicates === 1 ? "" : "s"} (already imported).
              </p>
            )}
            {skippedDuplicates === 0 && <div className="mb-4" />}

            {/* Post All Section */}
            {!posted ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-6">
                <p className="text-sm text-amber-800 mb-4">
                  Imported transactions are in <strong>draft</strong> status.
                  Post them now to include in your dashboard cashflow numbers.
                </p>
                <button
                  onClick={handlePostAll}
                  disabled={posting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {posting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Post All {importedCount} Transaction
                      {importedCount === 1 ? "" : "s"}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 mb-6">
                <p className="text-sm text-emerald-800">
                  <strong>All {importedCount} transactions posted!</strong>{" "}
                  They will now appear in your dashboard cashflow summary.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link
                href="/transactions"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                View Transactions
              </Link>
              <button
                onClick={() => {
                  setStep("upload");
                  setParseResult(null);
                  setEditedTransactions([]);
                  setSelectedRows(new Set());
                  setImportedCount(0);
                  setSkippedDuplicates(0);
                  setBatchId(null);
                  setPosted(false);
                  setError("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200"
              >
                Import Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
