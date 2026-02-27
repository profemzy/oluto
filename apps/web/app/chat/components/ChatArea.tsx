"use client";

import { useRef, useEffect, useState, useCallback } from "react";
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

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-edge-subtle" />
      <span className="text-xs font-medium text-muted">{date}</span>
      <div className="flex-1 h-px bg-edge-subtle" />
    </div>
  );
}

export function ChatArea({ messages, loading, onSend, onQuickAction }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

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

  // Group messages by date for separators
  const renderMessages = () => {
    const result: React.ReactNode[] = [];
    let lastDate = "";

    for (const msg of messages) {
      const msgDate = new Date(msg.created_at).toLocaleDateString("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      if (msgDate !== lastDate) {
        result.push(<DateSeparator key={`date-${msgDate}`} date={msgDate} />);
        lastDate = msgDate;
      }
      result.push(<MessageBubble key={msg.id} message={msg} />);
    }

    return result;
  };

  const handleQuickAction = (action: QuickAction) => {
    setShowQuickActions(false);
    onQuickAction(action);
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages area */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 relative">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-heading mb-2">How can I help?</h2>
            <p className="text-sm text-muted mb-8 max-w-md text-center">
              Ask me about your finances, create invoices, track expenses, or get insights about your business.
            </p>
            <QuickActions variant="welcome" onSelect={handleQuickAction} />
          </div>
        ) : (
          <>
            {renderMessages()}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-md bg-surface border border-edge-subtle px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-sm text-muted">Oluto is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => { scrollToBottom(); setAutoScroll(true); }}
            className="fixed bottom-24 right-8 p-2 rounded-full bg-surface border border-edge shadow-lg hover:shadow-xl transition-all z-20"
          >
            <svg className="w-5 h-5 text-heading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {/* Quick actions bar */}
      {showQuickActions && (
        <div className="border-t border-edge-subtle bg-surface-secondary">
          <QuickActions variant="compact" onSelect={handleQuickAction} />
        </div>
      )}

      {/* Input */}
      <InputBar
        onSend={onSend}
        loading={loading}
        onToggleQuickActions={() => setShowQuickActions((v) => !v)}
      />
    </div>
  );
}
