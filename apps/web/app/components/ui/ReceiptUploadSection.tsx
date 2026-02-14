"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { api, ReceiptResponse, ReceiptOcrData } from "@/app/lib/api";
import { formatFileSize } from "@/app/lib/format";
import {
  RECEIPT_ALLOWED_TYPES,
  RECEIPT_ALLOWED_EXTENSIONS,
  RECEIPT_MAX_SIZE_BYTES,
} from "@/app/lib/constants";

// --- Exported types for parent components ---

export interface PendingReceiptFile {
  file: File;
  runOcr: boolean;
  previewUrl: string | null;
}

export interface OcrSuggestion {
  vendor?: string;
  amount?: string;
  date?: string;
  gstAmount?: string;
  pstAmount?: string;
}

interface ReceiptUploadSectionProps {
  businessId: string;
  transactionId: string | null;
  onPendingFilesChange?: (files: PendingReceiptFile[]) => void;
  onOcrResult?: (suggestion: OcrSuggestion) => void;
  defaultRunOcr?: boolean;
}

// --- Helpers ---

function isAllowedType(type: string): boolean {
  return (RECEIPT_ALLOWED_TYPES as readonly string[]).includes(type);
}

function isImageType(type: string): boolean {
  return type === "image/jpeg" || type === "image/png";
}

function ocrDataToSuggestion(data: ReceiptOcrData): OcrSuggestion {
  return {
    vendor: data.vendor || undefined,
    amount: data.amount || undefined,
    date: data.date || undefined,
    gstAmount: data.tax_amounts?.gst || undefined,
    pstAmount: data.tax_amounts?.pst || undefined,
  };
}

function contentTypeIcon(contentType: string) {
  if (isImageType(contentType)) {
    return (
      <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

// --- OCR status badge ---

function OcrBadge({ status }: { status: ReceiptResponse["ocr_status"] }) {
  const styles = {
    none: "bg-surface-tertiary text-body",
    pending: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
    completed: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300",
    failed: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
  };
  const labels = { none: "No OCR", pending: "Processing", completed: "OCR Done", failed: "OCR Failed" };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// --- Main component ---

export function ReceiptUploadSection({
  businessId,
  transactionId,
  onPendingFilesChange,
  onOcrResult,
  defaultRunOcr = false,
}: ReceiptUploadSectionProps) {
  const [runOcr, setRunOcr] = useState(defaultRunOcr);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Pending mode state (new transaction — no transactionId yet)
  const [pendingFiles, setPendingFiles] = useState<PendingReceiptFile[]>([]);

  // Attached mode state (edit transaction — transactionId is set)
  const [receipts, setReceipts] = useState<ReceiptResponse[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const isAttached = transactionId !== null;

  // Cleanup object URLs on unmount
  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Load existing receipts in attached mode
  useEffect(() => {
    if (!isAttached) return;
    setLoadingReceipts(true);
    api
      .listReceipts(businessId, transactionId)
      .then(setReceipts)
      .catch(() => {})
      .finally(() => setLoadingReceipts(false));
  }, [businessId, transactionId, isAttached]);

  // Notify parent of pending files changes
  useEffect(() => {
    if (!isAttached) {
      onPendingFilesChange?.(pendingFiles);
    }
  }, [pendingFiles, isAttached, onPendingFilesChange]);

  const validateFile = useCallback((file: File): string | null => {
    if (!isAllowedType(file.type)) {
      return `"${file.name}" is not a supported file type. Use JPEG, PNG, or PDF.`;
    }
    if (file.size > RECEIPT_MAX_SIZE_BYTES) {
      return `"${file.name}" exceeds the 10 MB size limit (${formatFileSize(file.size)}).`;
    }
    return null;
  }, []);

  const addPendingFile = useCallback(
    (file: File) => {
      const previewUrl = isImageType(file.type) ? URL.createObjectURL(file) : null;
      if (previewUrl) objectUrlsRef.current.push(previewUrl);
      setPendingFiles((prev) => [...prev, { file, runOcr, previewUrl }]);
    },
    [runOcr]
  );

  const uploadImmediately = useCallback(
    async (file: File) => {
      if (!transactionId) return;
      setUploading(true);
      try {
        const result = await api.uploadReceipt(businessId, transactionId, file, runOcr);
        setReceipts((prev) => [...prev, result.receipt]);
        if (result.ocr_data && onOcrResult) {
          onOcrResult(ocrDataToSuggestion(result.ocr_data));
        }
      } catch (err) {
        setFileError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [businessId, transactionId, runOcr, onOcrResult]
  );

  const handleFiles = useCallback(
    (files: FileList) => {
      setFileError("");
      for (const file of Array.from(files)) {
        const error = validateFile(file);
        if (error) {
          setFileError(error);
          continue;
        }
        if (isAttached) {
          uploadImmediately(file);
        } else {
          addPendingFile(file);
        }
      }
    },
    [validateFile, isAttached, uploadImmediately, addPendingFile]
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
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const removePending = (index: number) => {
    setPendingFiles((prev) => {
      const removed = prev[index];
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDownload = async (receiptId: string) => {
    try {
      const { download_url } = await api.getReceiptDownloadUrl(businessId, receiptId);
      window.open(download_url, "_blank");
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Failed to get download URL");
    }
  };

  const handleDelete = async (receiptId: string) => {
    if (!confirm("Delete this receipt? This cannot be undone.")) return;
    try {
      await api.deleteReceipt(businessId, receiptId);
      setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Failed to delete receipt");
    }
  };

  const hasItems = isAttached ? receipts.length > 0 : pendingFiles.length > 0;

  return (
    <div>
      <label className="block text-sm font-bold leading-6 text-heading mb-2">
        Receipts / Invoices
        <span className="text-caption font-normal"> (optional)</span>
      </label>

      {/* OCR toggle */}
      <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={runOcr}
          onChange={(e) => setRunOcr(e.target.checked)}
          className="h-4 w-4 rounded border-edge text-cyan-600 focus:ring-cyan-500"
        />
        <span className="text-xs text-body">
          Extract data from receipt (OCR)
        </span>
      </label>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
          dragActive
            ? "border-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/50"
            : "border-edge bg-surface-secondary/50 hover:border-gray-400 hover:bg-surface-secondary"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={RECEIPT_ALLOWED_EXTENSIONS}
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <svg className="mx-auto h-8 w-8 text-caption" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-2 text-sm text-body">
          Drag &amp; drop files here, or{" "}
          <span className="font-bold text-cyan-600">browse</span>
        </p>
        <p className="mt-1 text-xs text-caption">
          JPEG, PNG, or PDF — max 10 MB
        </p>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface/80">
            <div className="animate-spin h-6 w-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Validation error */}
      {fileError && (
        <p className="mt-2 text-xs font-bold text-red-600">{fileError}</p>
      )}

      {/* File list */}
      {hasItems && (
        <ul className="mt-3 divide-y divide-edge-subtle rounded-xl border border-edge bg-surface overflow-hidden">
          {/* Pending files (new transaction mode) */}
          {!isAttached &&
            pendingFiles.map((pf, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                {pf.previewUrl ? (
                  <Image
                    src={pf.previewUrl}
                    alt={pf.file.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-tertiary flex-shrink-0">
                    {contentTypeIcon(pf.file.type)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">
                    {pf.file.name}
                  </p>
                  <p className="text-xs text-muted">
                    {formatFileSize(pf.file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  className="rounded-lg p-1.5 text-caption hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  title="Remove"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}

          {/* Existing receipts (edit transaction mode) */}
          {isAttached && loadingReceipts && (
            <li className="px-4 py-3 text-center text-xs text-muted">
              Loading receipts...
            </li>
          )}
          {isAttached &&
            receipts.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-tertiary flex-shrink-0">
                  {contentTypeIcon(r.content_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">
                    {r.original_filename}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      {formatFileSize(r.file_size)}
                    </span>
                    <OcrBadge status={r.ocr_status} />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDownload(r.id)}
                    className="rounded-lg p-1.5 text-caption hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-colors"
                    title="Download"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="rounded-lg p-1.5 text-caption hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    title="Delete"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
