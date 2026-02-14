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
import type { PendingReceiptFile } from "./ReceiptUploadSection";

interface BillReceiptSectionProps {
  businessId: string;
  billId: string | null;
  onPendingFilesChange?: (files: PendingReceiptFile[]) => void;
  defaultRunOcr?: boolean;
}

// --- Helpers ---

function isAllowedType(type: string): boolean {
  return (RECEIPT_ALLOWED_TYPES as readonly string[]).includes(type);
}

function isImageType(type: string): boolean {
  return type === "image/jpeg" || type === "image/png";
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
    none: "bg-gray-100 text-gray-600",
    pending: "bg-amber-50 text-amber-700",
    completed: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-700",
  };
  const labels = { none: "No OCR", pending: "Processing", completed: "OCR Done", failed: "OCR Failed" };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// --- Main component ---

export function BillReceiptSection({
  businessId,
  billId,
  onPendingFilesChange,
  defaultRunOcr = false,
}: BillReceiptSectionProps) {
  const [runOcr, setRunOcr] = useState(defaultRunOcr);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Pending mode state (new bill — no billId yet)
  const [pendingFiles, setPendingFiles] = useState<PendingReceiptFile[]>([]);

  // Attached mode state (existing bill — billId is set)
  const [receipts, setReceipts] = useState<ReceiptResponse[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const isAttached = billId !== null;

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
      .listBillReceipts(businessId, billId)
      .then(setReceipts)
      .catch(() => {})
      .finally(() => setLoadingReceipts(false));
  }, [businessId, billId, isAttached]);

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
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        return;
      }
      setFileError("");

      // Create preview URL for images
      let previewUrl: string | null = null;
      if (isImageType(file.type)) {
        previewUrl = URL.createObjectURL(file);
        objectUrlsRef.current.push(previewUrl);
      }

      setPendingFiles((prev) => [...prev, { file, runOcr, previewUrl }]);
    },
    [runOcr, validateFile]
  );

  const removePendingFile = useCallback((index: number) => {
    setPendingFiles((prev) => {
      const file = prev[index];
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
        objectUrlsRef.current = objectUrlsRef.current.filter((u) => u !== file.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      Array.from(files).forEach(addPendingFile);
      e.target.value = "";
    },
    [addPendingFile]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        Array.from(files).forEach(addPendingFile);
      }
    },
    [addPendingFile]
  );

  const handleUpload = useCallback(async () => {
    if (!isAttached || pendingFiles.length === 0) return;
    setUploading(true);
    setFileError("");

    try {
      for (const pf of pendingFiles) {
        await api.uploadBillReceipt(businessId, billId, pf.file, pf.runOcr);
      }
      // Reload receipts
      const updated = await api.listBillReceipts(businessId, billId);
      setReceipts(updated);
      setPendingFiles([]);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [businessId, billId, isAttached, pendingFiles]);

  const handleDelete = useCallback(
    async (receiptId: string) => {
      if (!confirm("Delete this receipt?")) return;
      try {
        await api.deleteReceipt(businessId, receiptId);
        setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
      } catch (err) {
        setFileError(err instanceof Error ? err.message : "Delete failed");
      }
    },
    [businessId]
  );

  const handleDownload = useCallback(
    async (receiptId: string) => {
      try {
        const { download_url } = await api.getReceiptDownloadUrl(businessId, receiptId);
        window.open(download_url, "_blank");
      } catch (err) {
        setFileError(err instanceof Error ? err.message : "Download failed");
      }
    },
    [businessId]
  );

  return (
    <div className="space-y-4">
      {/* File upload area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
          dragActive
            ? "border-cyan-500 bg-cyan-50"
            : "border-gray-300 hover:border-gray-400 bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={RECEIPT_ALLOWED_EXTENSIONS}
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-bold text-cyan-600 hover:text-cyan-500"
            >
              Click to upload
            </button>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPEG, PNG, or PDF up to 10 MB
          </p>
        </div>
      </div>

      {/* OCR toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="runOcr"
          checked={runOcr}
          onChange={(e) => setRunOcr(e.target.checked)}
          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
        />
        <label htmlFor="runOcr" className="text-sm text-gray-700">
          Extract text from receipt/invoice (OCR)
        </label>
      </div>

      {fileError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {fileError}
        </div>
      )}

      {/* Pending files (new bill mode or attached mode with pending uploads) */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">
              Pending ({pendingFiles.length})
            </p>
            {isAttached && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="text-sm font-bold text-cyan-600 hover:text-cyan-500 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Now"}
              </button>
            )}
          </div>
          {pendingFiles.map((pf, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
            >
              {pf.previewUrl ? (
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-gray-200">
                  <Image
                    src={pf.previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded border border-gray-200">
                  {contentTypeIcon(pf.file.type)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {pf.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(pf.file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removePendingFile(idx)}
                className="flex-shrink-0 text-gray-400 hover:text-red-500"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Attached receipts (existing bill mode) */}
      {isAttached && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-gray-700">
            Attached ({loadingReceipts ? "..." : receipts.length})
          </p>
          {loadingReceipts ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-600 border-r-transparent"></div>
            </div>
          ) : receipts.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No receipts attached yet
            </p>
          ) : (
            receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded border border-gray-200">
                  {contentTypeIcon(receipt.content_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {receipt.original_filename}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-500">
                      {formatFileSize(receipt.file_size)}
                    </p>
                    <OcrBadge status={receipt.ocr_status} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(receipt.id)}
                  className="flex-shrink-0 text-cyan-600 hover:text-cyan-500"
                  title="Download"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(receipt.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500"
                  title="Delete"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
