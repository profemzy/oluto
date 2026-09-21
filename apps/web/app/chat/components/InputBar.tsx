"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { formatFileSize } from "@/app/lib/format";
import { toastError } from "@/app/lib/toast";

interface InputBarProps {
  onSend: (message: string, file?: File) => void;
  loading: boolean;
  onToggleQuickActions?: () => void;
  quickActionsActive?: boolean;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function InputBar({
  onSend,
  loading,
  onToggleQuickActions,
  quickActionsActive,
  disabled = false,
}: InputBarProps) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      const newHeight = Math.min(el.scrollHeight, 160);
      el.style.height = newHeight + "px";
    }
  }, [text]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (disabled || (!trimmed && !file)) return;
    onSend(trimmed || (file ? `Uploaded: ${file.name}` : ""), file || undefined);
    setText("");
    setFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, file, onSend, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > MAX_FILE_SIZE) {
        toastError("File must be under 20MB");
        return;
      }
      setFile(f);
    }
  };

  const isEmpty = !text.trim() && !file;
  const charCount = text.length;

  return (
    <div className="space-y-3 p-3 sm:p-4">
      {/* Selected file preview */}
      {file && (
        <div className="flex items-center gap-3 rounded-xl border border-edge bg-surface-secondary p-3">
          <div className="rounded-lg bg-surface p-2 text-[var(--color-brand-primary)] border border-edge-subtle">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-heading">
              {file.name}
            </p>
            <p className="text-[11px] text-muted">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-heading min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
            title="Remove file"
            aria-label="Remove attached file"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <div
          className={`flex items-end gap-2 rounded-2xl border bg-surface p-2 transition-all duration-200 sm:gap-3 sm:p-3 ${
            isFocused
              ? "border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/20"
              : "border-edge hover:border-gray-400"
          } ${loading ? "opacity-70" : ""}`}
        >
          {/* Quick actions toggle */}
          {onToggleQuickActions && (
            <button
              type="button"
              onClick={onToggleQuickActions}
              className={`shrink-0 rounded-xl p-2 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                quickActionsActive
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
                  : "text-muted hover:bg-surface-hover hover:text-heading"
              } disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]`}
              title={quickActionsActive ? "Hide quick actions" : "Show quick actions"}
              aria-label={quickActionsActive ? "Hide quick actions" : "Show quick actions"}
              disabled={loading || disabled}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </button>
          )}

          {/* File attach */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 rounded-xl p-2 text-muted transition-colors hover:bg-surface-hover hover:text-heading disabled:opacity-50 min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
            title="Attach file"
            aria-label="Attach file"
            disabled={loading || disabled}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.csv"
            onChange={handleFileChange}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={file ? "Add instruction for attached file..." : "Instruct agent or query double-entry records..."}
            aria-label="Message or instructions for Oluto Agent"
            rows={1}
            disabled={loading || disabled}
            className="max-h-[160px] min-h-[24px] flex-1 resize-none border-0 bg-transparent py-2 text-sm text-heading placeholder:text-muted focus:ring-0 focus:outline-none disabled:cursor-not-allowed sm:text-[14px]"
          />

          {/* Character count */}
          {isFocused && charCount > 0 && (
            <span className="shrink-0 self-center pb-2 text-[10px] text-muted font-tabular">{charCount}</span>
          )}

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || disabled || isEmpty}
            aria-label="Send instruction"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] sm:h-11 sm:w-11 ${
              isEmpty || loading || disabled
                ? "cursor-not-allowed bg-surface-tertiary text-muted"
                : "bg-[#087E78] dark:bg-teal-600 text-white hover:bg-[#066762] dark:hover:bg-teal-500 shadow-sm"
            }`}
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Floating hint */}
        <div
          className={`absolute -top-6 right-0 text-[10px] text-muted transition-opacity duration-200 ${
            isFocused && text.includes(" ") ? "opacity-100" : "opacity-0"
          }`}
        >
          Enter to send, Shift+Enter for newline
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] text-muted sm:text-xs">
          {file
            ? "Receipt will be parsed by configured vision model; proposal requires human approval before posting."
            : "Agent proposals require human review before creating durable financial effects."}
        </p>
        <div className="hidden items-center gap-2 text-[10px] text-muted sm:flex">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-edge bg-surface-secondary px-1.5 py-0.5 font-sans">
              &#x21B5;
            </kbd>
            <span>to send</span>
          </span>
        </div>
      </div>
    </div>
  );
}
