"use client";

import { useState, memo } from "react";
import { ChatMessage } from "@/app/lib/api";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageBubbleProps {
  message: ChatMessage;
}

// Icons
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BotIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function parseFileAttachment(content: string): { text: string; fileName: string | null } {
  const match = content.match(/\[file:\s*(.+?)\]/);
  if (!match) return { text: content, fileName: null };
  const fileName = match[1].trim();
  const text = content.replace(match[0], "").trim();
  return { text, fileName };
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (message.role === "user") {
    return <UserBubble message={message} />;
  }

  if (message.role === "error") {
    return <ErrorBubble message={message} />;
  }

  return (
    <AssistantBubble
      message={message}
      copied={copied}
      onCopy={handleCopy}
    />
  );
});

function UserBubble({ message }: { message: ChatMessage }) {
  const { text, fileName } = parseFileAttachment(message.content);

  return (
    <div className="flex justify-end">
      <div className="max-w-[90%] sm:max-w-[85%] lg:max-w-[80%]">
        <div
          className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl rounded-tr-sm shadow-sm p-4 sm:p-5 group transition-all duration-200 hover:shadow-md"
        >
          {/* Avatar row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20">
              <UserIcon />
            </div>
            <span className="text-xs font-medium text-white/80">You</span>
            <span className="text-[10px] text-white/50">
              {formatTime(message.created_at)}
            </span>
          </div>

          {/* File attachment */}
          {fileName && (
            <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-white/10">
              <div className="p-2 rounded-lg bg-white/20">
                <FileIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{fileName}</p>
              </div>
            </div>
          )}

          {/* Content */}
          {text && <MarkdownRenderer content={text} variant="user" />}
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({
  message,
  copied,
  onCopy,
}: {
  message: ChatMessage;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] sm:max-w-[85%] lg:max-w-[80%]">
        <div
          className="bg-white dark:bg-[#1a1a25] border border-gray-200 dark:border-gray-800 rounded-2xl rounded-tl-sm shadow-sm p-4 sm:p-5 group transition-all duration-200 hover:shadow-md relative"
        >
          {/* Avatar row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900 dark:to-cyan-800 text-cyan-600 dark:text-cyan-400">
              <BotIcon />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Oluto</span>
            <span className="text-[10px] text-gray-400">
              {formatTime(message.created_at)}
            </span>
            {message.model && (
              <span className="text-[10px] text-gray-400">&middot; {message.model}</span>
            )}

            {/* Copy button */}
            <button
              onClick={onCopy}
              className={`ml-auto p-1.5 rounded-lg transition-all duration-200 ${
                copied
                  ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100"
              }`}
              title={copied ? "Copied!" : "Copy to clipboard"}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>

          {/* Content */}
          <MarkdownRenderer content={message.content} variant="assistant" />
        </div>
      </div>
    </div>
  );
}

function ErrorBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] sm:max-w-[85%] lg:max-w-[80%]">
        <div
          className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl rounded-tl-sm shadow-sm p-4 sm:p-5 transition-all duration-200 hover:shadow-md"
        >
          {/* Avatar row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-rose-200 dark:bg-rose-800 text-rose-600 dark:text-rose-400">
              <ErrorIcon />
            </div>
            <span className="text-xs font-medium text-gray-500">Error</span>
            <span className="text-[10px] text-gray-400">
              {formatTime(message.created_at)}
            </span>
          </div>

          {/* Content */}
          <p className="text-sm font-medium text-rose-700 dark:text-rose-200 mb-1">Something went wrong</p>
          <p className="text-sm text-rose-600 dark:text-rose-300 opacity-80">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
