"use client";

import { useState, useRef, useCallback } from "react";
import { formatFileSize } from "@/app/lib/format";

interface InputBarProps {
  onSend: (message: string, file?: File) => void;
  loading: boolean;
  onToggleQuickActions?: () => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function InputBar({ onSend, loading, onToggleQuickActions }: InputBarProps) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  return (
    <div className="border-t border-edge-subtle bg-surface p-4">
      {/* File preview */}
      {file && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-secondary">
          <svg className="w-4 h-4 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="text-sm text-heading truncate">{file.name}</span>
          <span className="text-xs text-muted">{formatFileSize(file.size)}</span>
          <button onClick={() => setFile(null)} className="ml-auto text-muted hover:text-red-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Quick actions toggle */}
        {onToggleQuickActions && (
          <button
            onClick={onToggleQuickActions}
            className="flex-shrink-0 p-2 rounded-lg text-muted hover:text-heading hover:bg-surface-hover transition-colors"
            title="Quick Actions"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        )}

        {/* File attach */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 rounded-lg text-muted hover:text-heading hover:bg-surface-hover transition-colors"
          title="Attach file"
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
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask Oluto anything..."
          rows={1}
          disabled={loading}
          className="flex-1 resize-none rounded-xl border border-edge bg-surface-secondary px-4 py-2.5 text-sm text-heading placeholder:text-muted focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
        />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={loading || (!text.trim() && !file)}
          className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
