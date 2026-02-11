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
import { CRA_CATEGORIES } from "@/app/lib/constants";

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
    (businessId: number, jobId: number) => {
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
          ai_suggested_category:
            t.ai_confidence > 0 ? t.category || undefined : undefined,
          ai_confidence: t.ai_confidence || undefined,
        })),
      });
      setImportedCount(result.imported_count);
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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <PageHeader
        title="Import Transactions"
        subtitle="Upload a bank or credit card statement"
        actions={
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Transactions
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert error={error} className="mb-6" />

        {/* Step: Upload */}
        {step === "upload" && (
          <div className="max-w-2xl mx-auto">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
                dragActive
                  ? "border-cyan-500 bg-cyan-50"
                  : "border-gray-300 bg-white hover:border-cyan-400 hover:bg-gray-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.pdf"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="mx-auto h-16 w-16 rounded-full bg-cyan-50 flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-cyan-600"
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

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {dragActive
                  ? "Drop your file here"
                  : "Drag & drop your statement"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse files
              </p>

              <div className="flex items-center justify-center gap-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <svg
                    className="w-3.5 h-3.5"
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                  <svg
                    className="w-3.5 h-3.5"
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

            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Supported formats
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0"
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
                <li className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0"
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
                <li className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-6"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processing your statement...
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {jobMessage || "This may take a moment for PDF files using OCR."}
            </p>

            {/* Progress bar */}
            {jobProgress > 0 && (
              <div className="w-full max-w-xs mx-auto">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>Progress</span>
                  <span>{jobProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      parseResult.file_type === "csv"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {parseResult.file_type.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
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
                <span className="text-sm text-gray-500">
                  {parseResult.total_count} transaction
                  {parseResult.total_count === 1 ? "" : "s"} found
                </span>
              </div>
            </div>

            {/* Warnings */}
            {parseResult.parse_warnings.length > 0 && (
              <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
                <h4 className="text-sm font-medium text-amber-800 mb-1">
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
                <div className="mb-6 rounded-lg bg-cyan-50 border border-cyan-200 p-4 flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-cyan-600 flex-shrink-0"
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
              <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-800">
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
                  className="text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  Deselect duplicates
                </button>
              </div>
            )}

            {/* Action bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={selectAll}
                  className="text-sm font-medium text-cyan-600 hover:text-cyan-500"
                >
                  Select all
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setSelectedRows(new Set())}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Deselect all
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {selectedRows.size} of {editedTransactions.length} selected
              </p>
            </div>

            {/* Transactions table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
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
                        } hover:bg-gray-50 transition-colors`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(index)}
                            onChange={() => toggleRow(index)}
                            className="h-4 w-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500"
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
                            className="w-full text-sm text-gray-900 border-0 bg-transparent focus:ring-1 focus:ring-cyan-500 rounded px-1 py-0.5 -mx-1"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span
                            className={`text-sm font-medium ${
                              parseFloat(txn.amount) < 0
                                ? "text-red-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {formatCurrency(txn.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
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
                              className="text-sm text-gray-700 border-0 bg-transparent focus:ring-1 focus:ring-cyan-500 rounded px-1 py-0.5 -mx-1 max-w-[200px]"
                            >
                              <option value="">—</option>
                              {CRA_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            {txn.ai_confidence >= 0.8 && (
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-300">
                                AI
                              </span>
                            )}
                            {txn.ai_confidence >= 0.5 &&
                              txn.ai_confidence < 0.8 && (
                                <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-300">
                                  AI?
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {txn.is_duplicate && (
                            <span
                              title="Potential duplicate"
                              className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
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

            {/* Confirm actions */}
            <div className="flex items-center justify-between">
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
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
              >
                Upload different file
              </button>
              <button
                onClick={handleConfirm}
                disabled={importing || selectedRows.size === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
              <svg
                className="h-8 w-8 text-emerald-600"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Import complete!
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Successfully imported {importedCount} transaction
              {importedCount === 1 ? "" : "s"} as drafts.
            </p>

            {/* Post All Section */}
            {!posted ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800 mb-3">
                  Imported transactions are in <strong>draft</strong> status.
                  Post them now to include in your dashboard cashflow numbers.
                </p>
                <button
                  onClick={handlePostAll}
                  disabled={posting}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-emerald-800">
                  <strong>All {importedCount} transactions posted!</strong>{" "}
                  They will now appear in your dashboard cashflow summary.
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <Link
                href="/transactions"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
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
                  setBatchId(null);
                  setPosted(false);
                  setError("");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
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
