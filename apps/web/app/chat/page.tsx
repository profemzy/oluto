"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader } from "@/app/components";
import { toastError } from "@/app/lib/toast";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatArea } from "./components/ChatArea";
import { QuickAction } from "./components/QuickActions";
import { ReceiptApprovalDialog, ReceiptReviewDialog } from "./components/ReceiptRunDialogs";
import type {
  ApprovalRequestResponse,
  ArtifactResponse,
  InputRequestResponse,
} from "@/app/lib/generated/agent-api";
import type { Account } from "@/app/lib/api/types";

type PendingReceiptReview = { request: InputRequestResponse; accounts: Account[] };
type PendingReceiptApproval = { request: ApprovalRequestResponse; artifact: ArtifactResponse };

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [receiptReview, setReceiptReview] = useState<PendingReceiptReview | null>(null);
  const [receiptApproval, setReceiptApproval] = useState<PendingReceiptApproval | null>(null);
  const [submittingReceiptAction, setSubmittingReceiptAction] = useState(false);
  const [locale, setLocale] = useState<"en-CA" | "fr-CA">("en-CA");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingQuickActionRef = useRef<QuickAction | null>(null);
  const observedRunsRef = useRef(new Set<string>());

  const businessId = user?.business_id;

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("oluto-agent-locale");
    if (savedLocale === "en-CA" || savedLocale === "fr-CA") {
      setLocale(savedLocale);
      return;
    }
    if (window.navigator.language.toLowerCase().startsWith("fr")) {
      setLocale("fr-CA");
    }
  }, []);

  const changeLocale = useCallback((nextLocale: "en-CA" | "fr-CA") => {
    window.localStorage.setItem("oluto-agent-locale", nextLocale);
    setLocale(nextLocale);
  }, []);

  // --- Queries ---

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", businessId],
    queryFn: () => api.listConversations(businessId!),
    enabled: !!businessId,
  });

  const { data: capabilityDocument } = useQuery({
    queryKey: ["agent-capabilities", businessId],
    queryFn: () => api.chat.getCapabilities(businessId!),
    enabled: !!businessId,
    refetchInterval: 60_000,
  });

  const capabilities = capabilityDocument?.capabilities;
  const bookkeeperEnabled = capabilities?.conversational_bookkeeper !== false;
  const receiptEnabled = capabilities?.receipt_snap !== false;

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", businessId, activeId],
    queryFn: () => api.listMessages(businessId!, activeId!),
    enabled: !!businessId && !!activeId,
  });

  // --- Mutations ---

  const renameConversation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.updateConversation(businessId!, id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", businessId] });
    },
  });

  const deleteConversation = useMutation({
    mutationFn: (id: string) => api.deleteConversation(businessId!, id),
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", businessId] });
      if (activeId === deletedId) setActiveId(null);
    },
    onError: (err) =>
      toastError(err instanceof Error ? err.message : "Failed to delete conversation"),
  });

  // --- Durable Run lifecycle ---

  const pendingRunId = useMemo(() => {
    const assistantRunIds = new Set(
      messages.filter((message) => message.role === "assistant").map((message) => message.run_id)
    );
    return [...messages]
      .reverse()
      .find(
        (message) =>
          message.role === "user" && message.run_id && !assistantRunIds.has(message.run_id)
      )?.run_id;
  }, [messages]);

  const observeRun = useCallback(
    async (conversationId: string, runId: string) => {
      if (!businessId || observedRunsRef.current.has(runId)) return;
      observedRunsRef.current.add(runId);
      setActiveRunId(runId);
      setSending(true);
      try {
        const run = await api.chat.waitForRun(businessId, runId, async ({ event }) => {
          if (event.type === "message.completed") {
            await queryClient.invalidateQueries({
              queryKey: ["messages", businessId, conversationId],
            });
          }
          if (event.type === "input.requested") {
            const requestId = String(event.data.input_request_id ?? "");
            if (requestId) {
              const [request, accounts] = await Promise.all([
                api.chat.getInputRequest(businessId, requestId),
                api.listAccounts(businessId),
              ]);
              setReceiptReview({ request, accounts });
            }
          }
          if (event.type === "approval.requested") {
            const requestId = String(event.data.approval_request_id ?? "");
            const artifactId = String(event.data.draft_artifact_id ?? "");
            if (requestId && artifactId) {
              const [request, artifact] = await Promise.all([
                api.chat.getApprovalRequest(businessId, requestId),
                api.chat.getArtifact(businessId, artifactId),
              ]);
              setReceiptApproval({ request, artifact });
            }
          }
        });
        if (run.status === "failed" || run.status === "expired") {
          toastError("Oluto could not complete that request. Please try again.");
        }
      } catch (err) {
        toastError(err instanceof Error ? err.message : "Lost connection to the agent Run");
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["messages", businessId, conversationId] }),
          queryClient.invalidateQueries({ queryKey: ["conversations", businessId] }),
        ]);
        setActiveRunId((current) => (current === runId ? null : current));
        setSending(false);
      }
    },
    [businessId, queryClient]
  );

  useEffect(() => {
    if (activeId && pendingRunId) void observeRun(activeId, pendingRunId);
  }, [activeId, pendingRunId, observeRun]);

  // --- Send message flow ---

  const sendMessage = useCallback(
    async (content: string, file?: File) => {
      if (!businessId || sending) return;
      if (!bookkeeperEnabled || (file && !receiptEnabled)) {
        toastError("This agent capability is temporarily unavailable.");
        return;
      }

      let convId = activeId;

      // Create conversation if none active
      if (!convId) {
        try {
          const conv = await api.createConversation(businessId, locale);
          queryClient.invalidateQueries({ queryKey: ["conversations", businessId] });
          convId = conv.id;
          setActiveId(conv.id);
        } catch (err) {
          toastError(err instanceof Error ? err.message : "Failed to create conversation");
          return;
        }
      }

      try {
        const accepted = file
          ? await api.chat.uploadReceipt(businessId, convId, file, locale)
          : await api.chat.postUserMessage(businessId, convId, content, locale);
        await queryClient.invalidateQueries({ queryKey: ["messages", businessId, convId] });
        await observeRun(convId, accepted.run_id);
      } catch (err) {
        toastError(err instanceof Error ? err.message : "Failed to start the agent Run");
      }
    },
    [
      businessId,
      activeId,
      sending,
      queryClient,
      observeRun,
      locale,
      bookkeeperEnabled,
      receiptEnabled,
    ]
  );

  const cancelRun = useCallback(async () => {
    if (!businessId || !activeRunId) return;
    try {
      await api.chat.cancelRun(businessId, activeRunId);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to stop the Run");
    }
  }, [businessId, activeRunId]);

  const cancelReceiptRun = useCallback(async () => {
    setReceiptReview(null);
    setReceiptApproval(null);
    await cancelRun();
  }, [cancelRun]);

  const submitReceiptReview = useCallback(
    async (response: Record<string, unknown>) => {
      if (!businessId || !receiptReview) return;
      setSubmittingReceiptAction(true);
      try {
        await api.chat.answerInputRequest(businessId, receiptReview.request, response);
        setReceiptReview(null);
      } catch (err) {
        toastError(err instanceof Error ? err.message : "Failed to submit receipt review");
      } finally {
        setSubmittingReceiptAction(false);
      }
    },
    [businessId, receiptReview]
  );

  const decideReceiptApproval = useCallback(
    async (decision: "approve" | "reject") => {
      if (!businessId || !receiptApproval) return;
      setSubmittingReceiptAction(true);
      try {
        await api.chat.decideApprovalRequest(businessId, receiptApproval.request, decision);
        setReceiptApproval(null);
      } catch (err) {
        toastError(err instanceof Error ? err.message : "Failed to record approval decision");
      } finally {
        setSubmittingReceiptAction(false);
      }
    },
    [businessId, receiptApproval]
  );

  // --- Quick action handler ---

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      if (action.needsFile) {
        pendingQuickActionRef.current = action;
        fileInputRef.current?.click();
      } else {
        sendMessage(action.prompt);
      }
    },
    [sendMessage]
  );

  const handleQuickActionFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const action = pendingQuickActionRef.current;
      if (file && action) {
        sendMessage(action.prompt, file);
      }
      pendingQuickActionRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [sendMessage]
  );

  // --- Render ---

  if (authLoading) return <PageLoader />;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0a0a14]">
      {/* Sidebar — desktop: inline, mobile: overlay */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={() => {
          setActiveId(null);
        }}
        onRename={(id, title) => renameConversation.mutate({ id, title })}
        onDelete={(id) => deleteConversation.mutate(id)}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        locale={locale}
        onLocaleChange={changeLocale}
      />

      {/* Main chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Responsive header bar for < 1280px */}
        <div className="flex items-center justify-between border-b border-edge bg-surface px-3 py-2 xl:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open conversation history"
              className="rounded-lg p-2 text-muted hover:text-heading hover:bg-surface-hover transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#087E78] text-white text-xs font-bold shadow-sm">
                O
              </div>
              <span className="text-sm font-bold text-heading">Agent Operations</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveId(null);
            }}
            className="rounded-lg p-2 text-muted hover:text-heading hover:bg-surface-hover transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
            title="New conversation"
            aria-label="Start new conversation"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        <ChatArea
          messages={messages}
          loading={sending}
          onSend={sendMessage}
          onQuickAction={handleQuickAction}
          onCancel={activeRunId ? cancelRun : undefined}
          unavailableReason={
            bookkeeperEnabled
              ? undefined
              : "The financial assistant is temporarily unavailable. Your existing conversations remain readable."
          }
        />
      </div>

      {/* Hidden file input for quick actions that need files */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.csv"
        onChange={handleQuickActionFile}
      />
      {receiptReview && (
        <ReceiptReviewDialog
          request={receiptReview.request}
          accounts={receiptReview.accounts}
          submitting={submittingReceiptAction}
          onSubmit={submitReceiptReview}
          onCancel={cancelReceiptRun}
        />
      )}
      {receiptApproval && (
        <ReceiptApprovalDialog
          request={receiptApproval.request}
          artifact={receiptApproval.artifact}
          submitting={submittingReceiptAction}
          onDecide={decideReceiptApproval}
        />
      )}
    </div>
  );
}
