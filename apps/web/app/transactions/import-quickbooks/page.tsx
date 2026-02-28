"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { api, QbImportParseResponse, QbAccountConfirmItem, QbImportConfirmResponse, QbJournalCategory } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";
import { CRA_CATEGORIES } from "@/app/lib/constants";

type Step = "upload" | "review" | "categorize" | "results";

const STEPS: Step[] = ["upload", "review", "categorize", "results"];
const STEP_LABELS: Record<Step, string> = {
  upload: "Upload",
  review: "Review",
  categorize: "Categorize",
  results: "Results",
};

const FILE_TYPES = [
  { key: "accounts", label: "Chart of Accounts" },
  { key: "customers", label: "Customers" },
  { key: "vendors", label: "Vendors" },
  { key: "journal", label: "Journal Entries" },
  { key: "invoices", label: "Invoices" },
  { key: "bills", label: "Bills" },
  { key: "payments", label: "Payments" },
] as const;

function FileUploadArea({ label, fileKey, files, setFiles }: {
  label: string;
  fileKey: string;
  files: Record<string, File>;
  setFiles: (fn: (prev: Record<string, File>) => Record<string, File>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const file = files[fileKey];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) {
      setFiles((prev) => ({ ...prev, [fileKey]: f }));
    }
  };

  return (
    <div
      className="border-2 border-dashed border-edge rounded-xl p-4 text-center hover:border-cyan-400 transition-colors cursor-pointer"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setFiles((prev) => ({ ...prev, [fileKey]: f }));
        }}
      />
      <p className="text-sm font-bold text-heading mb-1">{label}</p>
      {file ? (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-emerald-600 font-medium">{file.name}</span>
          <button
            className="text-xs text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              setFiles((prev) => {
                const next = { ...prev };
                delete next[fileKey];
                return next;
              });
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted">Drop CSV or click to browse</p>
      )}
    </div>
  );
}

export default function QuickBooksImportPage() {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<Record<string, File>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parseResult, setParseResult] = useState<QbImportParseResponse | null>(null);
  const [accountActions, setAccountActions] = useState<Record<number, "create_new" | "merge" | "skip">>({});
  const [categoryOverrides, setCategoryOverrides] = useState<Record<number, string>>({});
  const [importResult, setImportResult] = useState<QbImportConfirmResponse | null>(null);

  if (authLoading) return <PageLoader />;

  const handleParse = async () => {
    if (!user?.business_id || Object.keys(files).length === 0) return;
    setError("");
    setLoading(true);
    try {
      const result = await api.parseQuickBooksImport(user.business_id, files);
      setParseResult(result);
      // Default all account actions
      const actions: Record<number, "create_new" | "merge" | "skip"> = {};
      result.accounts.forEach((a, i) => {
        actions[i] = a.conflict ? (a.conflict.suggested_action as "create_new" | "merge" | "skip") : "create_new";
      });
      setAccountActions(actions);
      // Initialize category overrides from server suggestions
      const cats: Record<number, string> = {};
      result.journal_entries.forEach((j, i) => {
        cats[i] = j.suggested_category || "Other expenses";
      });
      setCategoryOverrides(cats);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse files");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!user?.business_id || !parseResult) return;
    setError("");
    setLoading(true);
    try {
      const accounts: QbAccountConfirmItem[] = parseResult.accounts.map((a, i) => ({
        parsed_account: a,
        action: accountActions[i] || "create_new",
        merge_with_account_id: accountActions[i] === "merge" && a.conflict ? a.conflict.existing_account_id : undefined,
      }));
      const categories: QbJournalCategory[] = Object.entries(categoryOverrides)
        .filter(([, cat]) => cat && cat !== "Other expenses")
        .map(([idx, category]) => ({ index: parseInt(idx), category }));
      const result = await api.confirmQuickBooksImport(user.business_id, {
        accounts,
        customers: parseResult.customers,
        vendors: parseResult.vendors,
        journal_entries: parseResult.journal_entries,
        invoices: parseResult.invoices,
        bills: parseResult.bills,
        payments: parseResult.payments,
        categories,
      });
      setImportResult(result);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm import");
    } finally {
      setLoading(false);
    }
  };

  const hasJournalEntries = parseResult && parseResult.journal_entries.length > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-secondary relative">
      <PageHeader
        title="QuickBooks Import"
        subtitle="Import your QuickBooks data via CSV files"
        actions={
          <Link href="/transactions/import" className="group inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2 text-sm font-bold text-body shadow-sm hover:bg-surface-hover transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Bank Import
          </Link>
        }
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white" :
                (STEPS.indexOf(step) > i ? "bg-emerald-100 text-emerald-700" : "bg-surface-tertiary text-muted")
              }`}>
                {STEPS.indexOf(step) > i ? "\u2713" : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === s ? "text-heading" : "text-muted"}`}>
                {STEP_LABELS[s]}
              </span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-edge-subtle" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-6">
            <p className="text-sm text-body mb-6">
              Export your data from QuickBooks as CSV files. Upload one or more entity types below.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {FILE_TYPES.map(({ key, label }) => (
                <FileUploadArea
                  key={key}
                  fileKey={key}
                  label={label}
                  files={files}
                  setFiles={setFiles}
                />
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleParse}
                disabled={loading || Object.keys(files).length === 0}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {loading ? "Parsing..." : "Parse Files"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === "review" && parseResult && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Accounts", count: parseResult.accounts.length },
                { label: "Customers", count: parseResult.customers.length },
                { label: "Vendors", count: parseResult.vendors.length },
                { label: "Journal Entries", count: parseResult.journal_entries.length },
                { label: "Invoices", count: parseResult.invoices.length },
                { label: "Bills", count: parseResult.bills.length },
                { label: "Payments", count: parseResult.payments.length },
              ].filter(s => s.count > 0).map(s => (
                <div key={s.label} className="bg-surface rounded-xl border border-edge-subtle p-4 text-center">
                  <p className="text-2xl font-bold text-heading">{s.count}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Warnings */}
            {parseResult.warnings.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 p-4">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2">Warnings</p>
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                  {parseResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            {/* Account conflicts */}
            {parseResult.accounts.some(a => a.conflict) && (
              <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-surface-secondary">
                  <h3 className="text-sm font-bold text-heading">Account Conflicts</h3>
                </div>
                <div className="divide-y divide-edge-subtle">
                  {parseResult.accounts.map((a, i) =>
                    a.conflict ? (
                      <div key={i} className="px-6 py-3 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-heading">{a.name}</p>
                          <p className="text-xs text-muted">
                            Matches: {a.conflict.existing_account_name} ({a.conflict.match_type})
                          </p>
                        </div>
                        <select
                          value={accountActions[i] || "create_new"}
                          onChange={(e) => setAccountActions((prev) => ({
                            ...prev,
                            [i]: e.target.value as "create_new" | "merge" | "skip",
                          }))}
                          className="rounded-lg border border-edge px-3 py-1.5 text-sm bg-surface text-heading"
                        >
                          <option value="create_new">Create New</option>
                          <option value="merge">Merge</option>
                          <option value="skip">Skip</option>
                        </select>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Accounts table */}
            {parseResult.accounts.length > 0 && (
              <details className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer text-sm font-bold text-heading hover:bg-surface-hover">
                  Accounts ({parseResult.accounts.length})
                </summary>
                <div className="border-t divide-y divide-edge-subtle">
                  {parseResult.accounts.map((a, i) => (
                    <div key={i} className="px-6 py-2 flex justify-between text-sm">
                      <span className="text-heading">{a.name}</span>
                      <span className="text-muted">{a.mapped_type} &middot; {a.suggested_code}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Journal entries with unbalanced flag */}
            {parseResult.journal_entries.length > 0 && (
              <details className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer text-sm font-bold text-heading hover:bg-surface-hover">
                  Journal Entries ({parseResult.journal_entries.length})
                  {parseResult.journal_entries.some(j => !j.is_balanced) && (
                    <span className="ml-2 text-xs text-red-600 font-bold">Has unbalanced entries</span>
                  )}
                </summary>
                <div className="border-t divide-y divide-edge-subtle">
                  {parseResult.journal_entries.map((j, i) => (
                    <div key={i} className={`px-6 py-2 flex justify-between text-sm ${!j.is_balanced ? "bg-red-50/50 dark:bg-red-950/30" : ""}`}>
                      <span className="text-heading">{j.date} {j.description || j.num || ""}</span>
                      <span className="text-muted">
                        D:{j.total_debit} C:{j.total_credit}
                        {!j.is_balanced && <span className="ml-1 text-red-600">UNBALANCED</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep("upload")}
                className="rounded-xl border border-edge bg-surface px-6 py-2.5 text-sm font-bold text-body shadow-sm hover:bg-surface-hover transition-all"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (hasJournalEntries) {
                    setStep("categorize");
                  } else {
                    handleConfirm();
                  }
                }}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {loading ? "Importing..." : hasJournalEntries ? "Next: Categorize" : "Confirm Import"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Categorize */}
        {step === "categorize" && parseResult && (
          <div className="space-y-6">
            <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-surface-secondary">
                <h3 className="text-sm font-bold text-heading">Assign CRA Categories</h3>
                <p className="text-xs text-muted mt-1">
                  Review and adjust the suggested T2125 expense categories for each journal entry.
                  Rows highlighted in amber have low-confidence suggestions.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-surface-secondary text-left">
                      <th className="px-4 py-3 font-bold text-heading">Date</th>
                      <th className="px-4 py-3 font-bold text-heading">Description</th>
                      <th className="px-4 py-3 font-bold text-heading text-right">Amount</th>
                      <th className="px-4 py-3 font-bold text-heading">Category</th>
                      <th className="px-4 py-3 font-bold text-heading text-center w-20">Conf.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-edge-subtle">
                    {parseResult.journal_entries.map((j, i) => {
                      const confidence = j.category_confidence ?? 0;
                      const isLow = confidence < 0.6;
                      const isNone = confidence === 0 || (categoryOverrides[i] === "Other expenses" && confidence < 0.3);
                      return (
                        <tr
                          key={i}
                          className={
                            isNone
                              ? "bg-amber-100/60 dark:bg-amber-950/40"
                              : isLow
                                ? "bg-amber-50/50 dark:bg-amber-950/20"
                                : ""
                          }
                        >
                          <td className="px-4 py-2.5 text-heading whitespace-nowrap">{j.date}</td>
                          <td className="px-4 py-2.5 text-body max-w-[200px] truncate">
                            {j.description || j.num || "—"}
                          </td>
                          <td className="px-4 py-2.5 text-heading text-right whitespace-nowrap font-mono">
                            ${j.total_debit}
                          </td>
                          <td className="px-4 py-2.5">
                            <select
                              value={categoryOverrides[i] || "Other expenses"}
                              onChange={(e) =>
                                setCategoryOverrides((prev) => ({
                                  ...prev,
                                  [i]: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-edge px-2 py-1.5 text-sm bg-surface text-heading"
                            >
                              {CRA_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span
                              className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                                confidence >= 0.8
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                                  : confidence >= 0.6
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                                    : confidence > 0
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {Math.round(confidence * 100)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep("review")}
                className="rounded-xl border border-edge bg-surface px-6 py-2.5 text-sm font-bold text-body shadow-sm hover:bg-surface-hover transition-all"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {loading ? "Importing..." : "Confirm Import"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === "results" && importResult && (
          <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-heading">Import Complete</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Accounts Created", count: importResult.accounts_created },
                { label: "Accounts Merged", count: importResult.accounts_merged },
                { label: "Accounts Skipped", count: importResult.accounts_skipped },
                { label: "Customers", count: importResult.customers_created },
                { label: "Vendors", count: importResult.vendors_created },
                { label: "Journal Entries", count: importResult.journal_entries_created },
                { label: "Invoices", count: importResult.invoices_created },
                { label: "Bills", count: importResult.bills_created },
                { label: "Payments", count: importResult.payments_created },
              ].filter(s => s.count > 0).map(s => (
                <div key={s.label} className="bg-surface-secondary rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{s.count}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 p-4 mb-6">
                <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-2">Errors</p>
                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                  {importResult.errors.map((e, i) => <li key={i}>[{e.entity_type}] {e.entity_name}: {e.error}</li>)}
                </ul>
              </div>
            )}

            <div className="flex justify-center">
              <Link
                href="/transactions"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all"
              >
                Done
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
