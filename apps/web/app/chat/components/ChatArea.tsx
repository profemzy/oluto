"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { ChatMessage } from "@/app/lib/api";
import { toastError } from "@/app/lib/toast";
import { MessageBubble } from "./MessageBubble";
import { InputBar } from "./InputBar";
import { QuickActions, QuickAction } from "./QuickActions";

interface ChatAreaProps {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string, file?: File) => void;
  onQuickAction: (action: QuickAction) => void;
  onCancel?: () => void;
  unavailableReason?: string;
}

// Group messages by date
function groupMessagesByDate(messages: ChatMessage[]) {
  const groups: { dateLabel: string; messages: ChatMessage[] }[] = [];

  messages.forEach((message) => {
    const messageDate = new Date(message.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateLabel: string;
    if (messageDate.toDateString() === today.toDateString()) {
      dateLabel = "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      dateLabel = "Yesterday";
    } else {
      dateLabel = messageDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }

    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dateLabel === dateLabel) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ dateLabel, messages: [message] });
    }
  });

  return groups;
}

// Date separator with gradient lines
function DateSeparator({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center justify-center">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
      <span className="rounded-full bg-gray-50/80 px-4 text-xs font-medium text-gray-400 dark:bg-[#0f0f18]/80">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
    </div>
  );
}

// Durable Run Status Banner
function LoadingBanner({ onCancel }: { onCancel?: () => void }) {
  return (
    <div className="sticky top-2 z-20 mb-4 mx-auto max-w-xl">
      <div className="card-financial p-3 bg-surface border-l-4 border-l-[#087E78] shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-4 w-4 rounded-full border-2 border-[#087E78] border-t-transparent animate-spin flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-heading">Agent Run in Progress</p>
            <p className="text-[11px] text-muted truncate">Executing workflow steps and inspecting double-entry ledger...</p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold px-2.5 py-1 rounded border border-edge text-muted hover:text-heading hover:bg-surface-hover transition-colors"
          >
            Cancel Run
          </button>
        )}
      </div>
    </div>
  );
}

// Typing indicator bubble
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-lg rounded-tl-none border border-edge bg-surface px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-muted font-medium">
          <div className="h-3.5 w-3.5 rounded-full border-2 border-[#087E78] border-t-transparent animate-spin" />
          <span>Generating verifiable ledger response...</span>
        </div>
      </div>
    </div>
  );
}

// Drag overlay for file drops
function DragOverlay({ isDragging }: { isDragging: boolean }) {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="rounded-2xl border-2 border-dashed border-[var(--color-brand-primary)] bg-surface p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/60 text-[var(--color-brand-primary)]">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p className="text-base font-bold text-heading">Drop files to upload</p>
        <p className="mt-1 text-xs text-muted">
          Receipts, bank statements, or invoices
        </p>
      </div>
    </div>
  );
}

// Welcome message with task-oriented quick actions
function WelcomeMessage({ onQuickAction }: { onQuickAction: (action: QuickAction) => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full">
      {/* Institutional Tile */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087E78] text-white shadow-sm font-bold text-lg">
          O
        </div>
        <div>
          <h2 className="text-base font-bold text-heading">
            Agent Operations
          </h2>
          <p className="text-xs text-muted">
            Verifiable double-entry accounting runtime backed by LedgerForge
          </p>
        </div>
      </div>

      {/* Task-oriented empty state */}
      <div className="w-full mt-4">
        <QuickActions variant="welcome" onSelect={onQuickAction} />
      </div>
    </div>
  );
}

export function ChatArea({
  messages,
  loading,
  onSend,
  onQuickAction,
  onCancel,
  unavailableReason,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const messageGroups = useMemo(() => groupMessagesByDate(messages), [messages]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (autoScroll) scrollToBottom();
  }, [messages, autoScroll, scrollToBottom]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
    setShowScrollBtn(!isNearBottom);
  };

  const handleQuickAction = (action: QuickAction) => {
    setShowQuickActions(false);
    onQuickAction(action);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (file.size > 20 * 1024 * 1024) {
      toastError("File too large. Maximum size is 20MB.");
      return;
    }

    if (!unavailableReason) onSend(`Upload: ${file.name}`, file);
  };

  const isEmpty = messages.length === 0;
  const showLoadingBanner =
    loading && messages.length > 0 && messages[messages.length - 1].role === "user";

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <DragOverlay isDragging={isDragging} />

      {/* Messages scroll area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 space-y-4 overflow-y-auto p-3 sm:p-4"
      >
        {isEmpty ? (
          loading ? (
            // Starting conversation state
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-edge bg-surface text-brand-teal shadow-sm">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-teal/20 border-t-brand-teal" />
              </div>
              <h2 className="mb-1 text-base font-semibold text-heading">
                Starting conversation...
              </h2>
              <p className="text-sm text-muted">
                Oluto is preparing your financial context
              </p>
            </div>
          ) : (
            <WelcomeMessage onQuickAction={handleQuickAction} />
          )
        ) : (
          <>
            {/* Loading banner at the top when processing */}
            {showLoadingBanner && <LoadingBanner onCancel={onCancel} />}

            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <DateSeparator label={group.dateLabel} />
                <div className="space-y-4">
                  {group.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator at bottom — always visible when loading */}
            {loading && <TypingIndicator />}
          </>
        )}

        {/* Bottom spacer for scroll clearance */}
        <div className="h-4" />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          type="button"
          onClick={() => {
            scrollToBottom();
            setAutoScroll(true);
          }}
          className="absolute right-4 bottom-24 z-20 rounded-full border border-edge bg-surface p-2.5 shadow-md text-muted hover:text-heading hover:bg-surface-hover transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          title="Scroll to bottom"
          aria-label="Scroll to latest messages"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}

      {/* Quick actions bar */}
      {showQuickActions && (
        <div className="border-t border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/20">
          <QuickActions variant="compact" onSelect={handleQuickAction} />
        </div>
      )}

      {/* Input */}
      {unavailableReason && (
        <p
          role="status"
          className="mx-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
        >
          {unavailableReason}
        </p>
      )}
      <InputBar
        onSend={onSend}
        loading={loading}
        onToggleQuickActions={() => setShowQuickActions((v) => !v)}
        quickActionsActive={showQuickActions}
        disabled={Boolean(unavailableReason)}
      />
    </div>
  );
}
