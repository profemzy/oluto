"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { ChatMessage } from "@/app/lib/api";
import { MessageBubble } from "./MessageBubble";
import { InputBar } from "./InputBar";
import { QuickActions, QuickAction } from "./QuickActions";

interface ChatAreaProps {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string, file?: File) => void;
  onQuickAction: (action: QuickAction) => void;
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
    <div className="flex items-center justify-center my-6">
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1" />
      <span className="px-4 text-xs font-medium text-gray-400 bg-gray-50/80 dark:bg-[#0f0f18]/80 rounded-full">
        {label}
      </span>
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent flex-1" />
    </div>
  );
}

// Loading banner — sticky pill at top
function LoadingBanner() {
  return (
    <div className="sticky top-0 z-10 flex justify-center mb-4">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/25">
        <div className="relative">
          <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        </div>
        <span className="text-sm font-medium">Oluto is thinking...</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// Typing indicator bubble
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white dark:bg-[#1a1a25] border border-gray-200 dark:border-gray-800 rounded-2xl rounded-tl-sm shadow-sm p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// Drag overlay for file drops
function DragOverlay({ isDragging }: { isDragging: boolean }) {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 z-50 bg-cyan-500/10 dark:bg-cyan-900/20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-[#1a1a25] border-2 border-dashed border-cyan-400 dark:border-cyan-600 rounded-2xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">Drop files to upload</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Receipts, statements, or documents</p>
      </div>
    </div>
  );
}

// Welcome message with quick actions
function WelcomeMessage({ onQuickAction }: { onQuickAction: (action: QuickAction) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Logo with glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-2xl">
          <span className="text-3xl font-bold text-white">O</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        How can I help you today?
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
        Ask about your finances, upload receipts, or use a quick action below to get started
      </p>

      {/* Quick Actions */}
      <QuickActions variant="welcome" onSelect={onQuickAction} />

      {/* Pro tip */}
      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Pro tip: Use quick actions anytime by clicking the lightning icon in the chat input</span>
      </div>
    </div>
  );
}

export function ChatArea({ messages, loading, onSend, onQuickAction }: ChatAreaProps) {
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
      alert("File too large. Maximum size is 20MB.");
      return;
    }

    onSend(`Upload: ${file.name}`, file);
  };

  const isEmpty = messages.length === 0;
  const showLoadingBanner = loading && messages.length > 0 && messages[messages.length - 1].role === "user";

  return (
    <div
      className="flex-1 flex flex-col min-h-0 relative"
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
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4"
      >
        {isEmpty ? (
          loading ? (
            // Starting conversation state
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-2xl">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Starting conversation...
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Oluto is preparing your financial insights
              </p>
              <div className="mt-4 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          ) : (
            <WelcomeMessage onQuickAction={handleQuickAction} />
          )
        ) : (
          <>
            {/* Loading banner at the top when processing */}
            {showLoadingBanner && <LoadingBanner />}

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
          onClick={() => {
            scrollToBottom();
            setAutoScroll(true);
          }}
          className="absolute bottom-24 right-4 p-2 rounded-full bg-white dark:bg-[#1a1a25] border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-20"
          title="Scroll to bottom"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Quick actions bar */}
      {showQuickActions && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
          <QuickActions variant="compact" onSelect={handleQuickAction} />
        </div>
      )}

      {/* Input */}
      <InputBar
        onSend={onSend}
        loading={loading}
        onToggleQuickActions={() => setShowQuickActions((v) => !v)}
        quickActionsActive={showQuickActions}
      />
    </div>
  );
}
