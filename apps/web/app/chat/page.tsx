"use client";

import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Conversation, ChatMessage } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader } from "@/app/components";
import { toastError } from "@/app/lib/toast";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatArea } from "./components/ChatArea";
import { QuickAction } from "./components/QuickActions";

export default function ChatPage() {
  const { user, loading: authLoading, timezone } = useAuth();
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingQuickActionRef = useRef<QuickAction | null>(null);

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
    onError: (err) => toastError(err instanceof Error ? err.message : "Failed to create conversation"),
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
    onError: (err) => toastError(err instanceof Error ? err.message : "Failed to delete conversation"),
  });

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

      // Build content with file annotation
      const msgContent = file ? `[file: ${file.name}] ${content}` : content;

      // Save user message to LedgerForge
      let userMsg: ChatMessage;
      try {
        userMsg = await api.createMessage(businessId, convId, {
          role: "user",
          content: msgContent,
        });
        queryClient.setQueryData<ChatMessage[]>(
          ["messages", businessId, convId],
          (old = []) => [...old, userMsg],
        );
      } catch (err) {
        toastError(err instanceof Error ? err.message : "Failed to save message");
        return;
      }

      // Call gateway
      setSending(true);
      try {
        const gatewayRes = file
          ? await api.sendChatMessageWithFile(content, file, businessId, timezone)
          : await api.sendChatMessage(content, businessId, timezone);

        if (gatewayRes.error) {
          // Save error message
          const errMsg = await api.createMessage(businessId, convId, {
            role: "error",
            content: gatewayRes.error,
          });
          queryClient.setQueryData<ChatMessage[]>(
            ["messages", businessId, convId],
            (old = []) => [...old, errMsg],
          );
        } else if (gatewayRes.response) {
          // Save assistant response
          const assistantMsg = await api.createMessage(businessId, convId, {
            role: "assistant",
            content: gatewayRes.response,
            model: gatewayRes.model,
          });
          queryClient.setQueryData<ChatMessage[]>(
            ["messages", businessId, convId],
            (old = []) => [...old, assistantMsg],
          );

          // Auto-title conversation from first assistant response
          const currentMsgs = queryClient.getQueryData<ChatMessage[]>(["messages", businessId, convId]) || [];
          const assistantCount = currentMsgs.filter((m) => m.role === "assistant").length;
          if (assistantCount === 1) {
            const title = gatewayRes.response.slice(0, 60).replace(/\n/g, " ");
            api.updateConversation(businessId, convId, { title }).then(() => {
              queryClient.invalidateQueries({ queryKey: ["conversations", businessId] });
            }).catch(() => {});
          }
        }
      } catch (err) {
        // Save gateway error as error message
        const errorContent = err instanceof Error ? err.message : "Failed to get response";
        try {
          const errMsg = await api.createMessage(businessId, convId, {
            role: "error",
            content: errorContent,
          });
          queryClient.setQueryData<ChatMessage[]>(
            ["messages", businessId, convId],
            (old = []) => [...old, errMsg],
          );
        } catch {
          toastError(errorContent);
        }
      } finally {
        setSending(false);
        queryClient.invalidateQueries({ queryKey: ["conversations", businessId] });
      }
    },
    [businessId, activeId, sending, timezone, queryClient],
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
    [sendMessage],
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
    [sendMessage],
  );

  // --- Render ---

  if (authLoading) return <PageLoader />;

  return (
    <div className="flex h-[calc(100vh-64px)]">
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
      />

      <ChatArea
        messages={messages}
        loading={sending}
        onSend={sendMessage}
        onQuickAction={handleQuickAction}
      />

      {/* Hidden file input for quick actions that need files */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.csv"
        onChange={handleQuickActionFile}
      />
    </div>
  );
}
