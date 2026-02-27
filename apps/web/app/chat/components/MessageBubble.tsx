"use client";

import { useState, memo } from "react";
import { ChatMessage } from "@/app/lib/api";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract file annotation if present: [file: filename.ext]
  const fileMatch = message.content.match(/\[file:\s*(.+?)\]/);
  const displayContent = message.content.replace(/\[file:\s*.+?\]\s*/g, "");

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] lg:max-w-[60%]">
          {fileMatch && (
            <div className="mb-1 flex justify-end">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-700/50 text-xs text-cyan-100">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {fileMatch[1]}
              </span>
            </div>
          )}
          <div className="rounded-2xl rounded-tr-md bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-3 text-white shadow-md">
            <MarkdownRenderer content={displayContent} variant="user" />
          </div>
          <div className="text-right mt-1">
            <span className="text-xs text-muted">{formatTime(message.created_at)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (message.role === "error") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] lg:max-w-[60%]">
          <div className="rounded-2xl rounded-tl-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-4 py-3 text-red-700 dark:text-red-300 shadow-sm">
            <p className="text-sm">{message.content}</p>
          </div>
          <div className="mt-1">
            <span className="text-xs text-muted">{formatTime(message.created_at)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Assistant
  return (
    <div className="flex justify-start group">
      <div className="max-w-[85%] lg:max-w-[70%]">
        <div className="rounded-2xl rounded-tl-md bg-surface border border-edge-subtle px-4 py-3 shadow-sm relative">
          <MarkdownRenderer content={message.content} variant="assistant" />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface-secondary text-muted hover:text-heading opacity-0 group-hover:opacity-100 transition-all"
            title="Copy"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted">{formatTime(message.created_at)}</span>
          {message.model && (
            <span className="text-xs text-muted">&middot; {message.model}</span>
          )}
        </div>
      </div>
    </div>
  );
});

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
