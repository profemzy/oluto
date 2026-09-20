import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatApi } from "@/app/lib/api/chat";

const businessId = "11111111-1111-4111-8111-111111111111";
const conversationId = "22222222-2222-4222-8222-222222222222";
const runId = "33333333-3333-4333-8333-333333333333";

describe("ChatApi", () => {
  const chat = new ChatApi("/agent");

  beforeEach(() => {
    vi.clearAllMocks();
    chat.setTokenProvider(async () => "agent-token");
  });

  it("loads Agent API conversations through the same-origin proxy", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      Response.json({
        items: [
          {
            id: conversationId,
            business_id: businessId,
            title: "Cash position",
            status: "active",
            version: 4,
            created_at: "2026-09-20T12:00:00Z",
            updated_at: "2026-09-20T12:01:00Z",
          },
        ],
        next_cursor: null,
      })
    );

    await expect(chat.listConversations(businessId)).resolves.toEqual([
      expect.objectContaining({
        id: conversationId,
        archived: false,
        version: 4,
      }),
    ]);

    const [url, options] = vi.mocked(global.fetch).mock.calls[0];
    expect(url).toBe(`/agent/api/v1/businesses/${businessId}/conversations?limit=100`);
    expect(new Headers(options?.headers).get("authorization")).toBe("Bearer agent-token");
  });

  it("consumes split SSE frames until a terminal Run event", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(': heartbeat\n\nid: 1\ndata: {"type":"run.run'));
        controller.enqueue(
          encoder.encode(
            'ning","data":{},"sequence":1}\n\nid: 2\ndata: {"type":"message.completed","data":{},"sequence":2}\n\nid: 3\ndata: {"type":"run.succeeded","data":{},"sequence":3}\n\n'
          )
        );
        controller.close();
      },
    });
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        new Response(stream, { headers: { "content-type": "text/event-stream" } })
      )
      .mockResolvedValueOnce(
        Response.json({
          id: runId,
          business_id: businessId,
          conversation_id: conversationId,
          status: "succeeded",
          version: 3,
        })
      );
    const eventTypes: string[] = [];

    const run = await chat.waitForRun(businessId, runId, ({ event }) => {
      eventTypes.push(event.type);
    });

    expect(run.status).toBe("succeeded");
    expect(eventTypes).toEqual(["run.running", "message.completed", "run.succeeded"]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("cancels a non-terminal Run with optimistic concurrency", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(Response.json({ id: runId, status: "running", version: 8 }))
      .mockResolvedValueOnce(Response.json({ id: runId, status: "cancelling", version: 9 }));

    await chat.cancelRun(businessId, runId);

    const [url, options] = vi.mocked(global.fetch).mock.calls[1];
    const headers = new Headers(options?.headers);
    expect(url).toBe(`/agent/api/v1/businesses/${businessId}/runs/${runId}/cancellation-requests`);
    expect(options?.method).toBe("POST");
    expect(headers.get("if-match")).toBe('"8"');
    expect(headers.get("idempotency-key")).toBeTruthy();
  });
});
