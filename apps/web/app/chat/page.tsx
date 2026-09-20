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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingQuickActionRef = useRef<QuickAction | null>(null);
  const observedRunsRef = useRef(new Set<string>());

  const businessId = user?.business_id;

  // --- Queries ---

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", businessId],
    queryFn: () => api.listConversations(businessId!),
    enabled: !!businessId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", businessId, activeId],
    queryFn: () => api.listMessages(businessId!, activeId!),
    enabled: !!businessId && !!activeId,
  });

  // --- Mutations ---

  const createConversation = useMutation({
    mutationFn: (title?: string) => api.createConversation(businessId!, title),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", businessId] });
      setActiveId(conv.id);
    },
    onError: (err) =>
      toastError(err instanceof Error ? err.message : "Failed to create conversation"),
  });

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

      let convId = activeId;

      // Create conversation if none active
      if (!convId) {
        try {
          const conv = await api.createConversation(businessId, content.slice(0, 60));
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
          ? await api.chat.uploadReceipt(businessId, convId, file)
          : await api.chat.postUserMessage(businessId, convId, content);
        await queryClient.invalidateQueries({ queryKey: ["messages", businessId, convId] });
        await observeRun(convId, accepted.run_id);
      } catch (err) {
        toastError(err instanceof Error ? err.message : "Failed to start the agent Run");
      }
    },
    [businessId, activeId, sending, queryClient, observeRun]
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
      />

      {/* Main chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header bar */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-3 py-2 md:hidden dark:border-gray-800 dark:bg-[#0f0f18]">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
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
          <div className="flex flex-1 items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-teal-600">
              <span className="text-xs font-bold text-white">O</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Oluto Chat</span>
          </div>
          <button
            onClick={() => {
              setActiveId(null);
            }}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-cyan-900/20"
            title="New chat"
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
