"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { formatFileSize } from "@/app/lib/format";

interface InputBarProps {
  onSend: (message: string, file?: File) => void;
  loading: boolean;
  onToggleQuickActions?: () => void;
  quickActionsActive?: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function InputBar({ onSend, loading, onToggleQuickActions, quickActionsActive }: InputBarProps) {
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
    if (!trimmed && !file) return;
    onSend(trimmed || (file ? `Uploaded: ${file.name}` : ""), file || undefined);
    setText("");
    setFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, file, onSend]);

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
        alert("File must be under 20MB");
        return;
      }
      setFile(f);
    }
  };

  const isEmpty = !text.trim() && !file;
  const charCount = text.length;

  return (
    <div className="p-3 sm:p-4 space-y-3">
      {/* Selected file preview */}
      {file && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800/50">
          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-800 text-cyan-600 dark:text-cyan-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="p-1.5 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Remove file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <div
          className={`flex items-end gap-2 sm:gap-3 bg-white dark:bg-[#1a1a25] border rounded-2xl p-2 sm:p-3 transition-all duration-300 ${
            isFocused
              ? "border-cyan-400 dark:border-cyan-600 shadow-lg shadow-cyan-500/10"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          } ${loading ? "opacity-70" : ""}`}
        >
          {/* Quick actions toggle */}
          {onToggleQuickActions && (
            <button
              onClick={onToggleQuickActions}
              className={`shrink-0 p-2 rounded-xl transition-colors ${
                quickActionsActive
                  ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20"
                  : "text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
              } disabled:opacity-50`}
              title={quickActionsActive ? "Hide quick actions" : "Show quick actions"}
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}

          {/* File attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 p-2 rounded-xl text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors disabled:opacity-50"
            title="Attach file"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
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
            placeholder={
              file
                ? "Add a message (optional)..."
                : "Ask about your finances..."
            }
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-transparent border-0 text-sm sm:text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 disabled:cursor-not-allowed min-h-[24px] max-h-[160px] py-2"
          />

          {/* Character count */}
          {isFocused && charCount > 0 && (
            <span className="shrink-0 text-[10px] text-gray-400 self-center pb-2">
              {charCount}
            </span>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={loading || isEmpty}
            className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
              isEmpty || loading
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Floating hint */}
        <div
          className={`absolute -top-8 right-0 text-[10px] text-gray-400 transition-opacity duration-200 ${
            isFocused && text.includes("\n") ? "opacity-100" : "opacity-0"
          }`}
        >
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] sm:text-xs text-gray-400">
          {file
            ? "Receipt will be processed with AI OCR"
            : "AI can make mistakes. Always verify important financial information."}
        </p>
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-sans">
              &#x21B5;
            </kbd>
            <span>to send</span>
          </span>
        </div>
      </div>
    </div>
  );
}
