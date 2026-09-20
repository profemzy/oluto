/** Agent API-backed conversation, durable Run, and persisted message access. */

import {
  AgentApiClient,
  AgentApiError,
  type AgentRunEventEnvelope,
  type AgentRunResponse,
  type ConversationResponse,
  type MessageResponse,
  type PostUserMessageResponse,
} from "../generated/agent-api";
import type { ChatMessage, Conversation } from "./types";

type TokenProvider = () => Promise<string | null>;

const TERMINAL_RUN_STATES = new Set(["succeeded", "failed", "cancelled", "expired"]);
const TERMINAL_EVENT_TYPES = new Set([
  "run.succeeded",
  "run.failed",
  "run.cancelled",
  "run.expired",
]);

export interface RunEventUpdate {
  event: AgentRunEventEnvelope;
  lastEventId: number;
}

export class ChatApi {
  private tokenProvider: TokenProvider | null = null;
  private readonly client: AgentApiClient;

  constructor(baseUrl: string) {
    this.client = new AgentApiClient(baseUrl, async () => {
      const token = await this.tokenProvider?.();
      if (!token) throw new AgentApiError(401, { code: "authentication_required" });
      return token;
    });
  }

  setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider;
  }

  async listConversations(businessId: string): Promise<Conversation[]> {
    const page = await this.client.request("listConversations", {
      path: { business_id: businessId },
      query: { limit: 100 },
    });
    return page.items.map(toConversation);
  }

  async createConversation(businessId: string, title?: string): Promise<Conversation> {
    const conversation = await this.client.request("createConversation", {
      path: { business_id: businessId },
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: {
        title: title?.trim() || "New chat",
        locale: "en-CA",
        visibility: "private",
      },
    });
    return toConversation(conversation);
  }

  async updateConversation(
    businessId: string,
    conversationId: string,
    data: { title?: string; archived?: boolean }
  ): Promise<Conversation> {
    const current = await this.client.request("getConversation", {
      path: { business_id: businessId, conversation_id: conversationId },
    });
    const updated = await this.client.request("updateConversation", {
      path: { business_id: businessId, conversation_id: conversationId },
      headers: { "If-Match": `"${current.version}"` },
      body: {
        title: data.title,
        status: data.archived === undefined ? undefined : data.archived ? "archived" : "active",
      },
    });
    return toConversation(updated);
  }

  async deleteConversation(businessId: string, conversationId: string): Promise<void> {
    await this.updateConversation(businessId, conversationId, { archived: true });
  }

  async listMessages(businessId: string, conversationId: string): Promise<ChatMessage[]> {
    const page = await this.client.request("listMessages", {
      path: { business_id: businessId, conversation_id: conversationId },
      query: { limit: 100 },
    });
    return page.items.map(toChatMessage);
  }

  async postUserMessage(
    businessId: string,
    conversationId: string,
    text: string,
    locale: "en-CA" | "fr-CA" = "en-CA"
  ): Promise<PostUserMessageResponse> {
    return this.client.request("postUserMessage", {
      path: { business_id: businessId, conversation_id: conversationId },
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: { content: [{ type: "text", text }], locale },
    });
  }

  async getRun(businessId: string, runId: string): Promise<AgentRunResponse> {
    return this.client.request("getAgentRun", {
      path: { business_id: businessId, run_id: runId },
    });
  }

  async waitForRun(
    businessId: string,
    runId: string,
    onEvent?: (update: RunEventUpdate) => void | Promise<void>
  ): Promise<AgentRunResponse> {
    let lastEventId: number | undefined;
    for (let reconnect = 0; reconnect < 4; reconnect += 1) {
      const response = await this.client.request("streamAgentRunEvents", {
        path: { business_id: businessId, run_id: runId },
        headers: lastEventId === undefined ? undefined : { "Last-Event-ID": lastEventId },
      });
      const consumed = await consumeRunEventStream(response, async (update) => {
        lastEventId = update.lastEventId;
        await onEvent?.(update);
      });
      const run = await this.getRun(businessId, runId);
      if (consumed.terminal || TERMINAL_RUN_STATES.has(run.status)) return run;
    }
    throw new Error("The Run event stream disconnected repeatedly");
  }

  async cancelRun(businessId: string, runId: string): Promise<void> {
    const run = await this.getRun(businessId, runId);
    if (TERMINAL_RUN_STATES.has(run.status)) return;
    await this.client.request("requestAgentRunCancellation", {
      path: { business_id: businessId, run_id: runId },
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
        "If-Match": `"${run.version}"`,
      },
      body: { reason_code: "user_requested" },
    });
  }
}

export async function consumeRunEventStream(
  response: Response,
  onEvent: (update: RunEventUpdate) => void | Promise<void>
): Promise<{ terminal: boolean; lastEventId?: number }> {
  if (!response.body) throw new Error("Run event stream has no response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let lastEventId: number | undefined;

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        const parsed = parseEventFrame(frame);
        if (!parsed) continue;
        lastEventId = parsed.lastEventId;
        await onEvent(parsed);
        const snapshotRun = parsed.event.type === "run.snapshot" ? parsed.event.data.run : null;
        const snapshotStatus =
          snapshotRun && typeof snapshotRun === "object" && "status" in snapshotRun
            ? String(snapshotRun.status)
            : null;
        if (
          TERMINAL_EVENT_TYPES.has(parsed.event.type) ||
          (snapshotStatus !== null && TERMINAL_RUN_STATES.has(snapshotStatus))
        ) {
          await reader.cancel();
          return { terminal: true, lastEventId };
        }
      }
      if (done) return { terminal: false, lastEventId };
    }
  } finally {
    reader.releaseLock();
  }
}

function parseEventFrame(frame: string): RunEventUpdate | null {
  if (!frame.trim() || frame.trimStart().startsWith(":")) return null;
  let id: number | undefined;
  let data: AgentRunEventEnvelope | undefined;
  for (const line of frame.split("\n")) {
    if (line.startsWith("id:")) id = Number(line.slice(3).trim());
    if (line.startsWith("data:")) {
      data = JSON.parse(line.slice(5).trim()) as AgentRunEventEnvelope;
    }
  }
  if (id === undefined || !Number.isSafeInteger(id) || id < 0 || !data) return null;
  return { event: data, lastEventId: id };
}

function toConversation(value: ConversationResponse): Conversation {
  return {
    id: value.id,
    title: value.title,
    business_id: value.business_id,
    created_at: value.created_at,
    updated_at: value.updated_at,
    archived: value.status === "archived",
    version: value.version,
  };
}

function toChatMessage(value: MessageResponse): ChatMessage {
  const text = value.content
    .filter((block) => block.type === "text" && typeof block.payload.text === "string")
    .map((block) => String(block.payload.text))
    .join("\n\n");
  return {
    id: value.id,
    conversation_id: value.conversation_id,
    role: value.author_type === "user" ? "user" : "assistant",
    content: text,
    created_at: value.created_at,
    run_id: value.initiating_run_id ?? undefined,
    status: value.status,
  };
}
