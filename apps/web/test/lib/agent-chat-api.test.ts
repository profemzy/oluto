import { beforeEach, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { ChatApi } from "@/app/lib/api/chat";

const businessId = "11111111-1111-4111-8111-111111111111";
const conversationId = "22222222-2222-4222-8222-222222222222";
const runId = "33333333-3333-4333-8333-333333333333";

describe("ChatApi", () => {
  const chat = new ChatApi("/agent");

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("crypto", webcrypto);
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

  it("loads Daily Briefing automation settings and delivered briefings", async () => {
    const automationId = "66666666-6666-4666-8666-666666666666";
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        Response.json({
          items: [
            {
              id: automationId,
              business_id: businessId,
              name: "Daily Finance Briefing",
              workflow_name: "daily_briefing",
              locale: "en-CA",
              cron_expression: "30 8 * * *",
              time_zone_name: "America/Vancouver",
              status: "active",
              version: 3,
            },
          ],
          next_cursor: null,
        })
      )
      .mockResolvedValueOnce(
        Response.json({
          items: [
            {
              run_id: runId,
              scheduled_for: "2026-09-20T15:30:00Z",
              locale: "en-CA",
              status: "succeeded",
              answer: "Your cash position is healthy.",
            },
          ],
          next_cursor: null,
        })
      );

    const [automations, briefings] = await Promise.all([
      chat.listAutomations(businessId),
      chat.listDailyBriefings(businessId),
    ]);

    expect(automations).toEqual([expect.objectContaining({ id: automationId })]);
    expect(briefings).toEqual([expect.objectContaining({ run_id: runId })]);
    expect(vi.mocked(global.fetch).mock.calls[1][0]).toBe(
      `/agent/api/v1/businesses/${businessId}/daily-briefings?limit=30`
    );
  });

  it("creates and updates a Daily Briefing schedule with optimistic concurrency", async () => {
    const automationId = "66666666-6666-4666-8666-666666666666";
    const schedule = {
      name: "Daily Finance Briefing",
      locale: "fr-CA" as const,
      cronExpression: "15 7 * * *",
      timeZoneName: "America/Toronto",
      status: "active" as const,
    };
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        Response.json({
          id: automationId,
          business_id: businessId,
          workflow_name: "daily_briefing",
          version: 1,
          ...schedule,
        })
      )
      .mockResolvedValueOnce(
        Response.json({
          id: automationId,
          business_id: businessId,
          workflow_name: "daily_briefing",
          version: 2,
          ...schedule,
        })
      );

    const created = await chat.saveDailyBriefingSchedule(businessId, schedule);
    await chat.saveDailyBriefingSchedule(businessId, {
      ...schedule,
      automation: created,
    });

    const [createUrl, createOptions] = vi.mocked(global.fetch).mock.calls[0];
    expect(createUrl).toBe(`/agent/api/v1/businesses/${businessId}/automations`);
    expect(createOptions?.method).toBe("POST");
    const [updateUrl, updateOptions] = vi.mocked(global.fetch).mock.calls[1];
    expect(updateUrl).toBe(`/agent/api/v1/businesses/${businessId}/automations/${automationId}`);
    expect(updateOptions?.method).toBe("PATCH");
    expect(new Headers(updateOptions?.headers).get("if-match")).toBe('"1"');
  });

  it("uploads a receipt directly to private storage before starting its durable Run", async () => {
    const documentId = "44444444-4444-4444-8444-444444444444";
    const file = new File([new Uint8Array([1, 2, 3, 4])], "receipt.png", {
      type: "image/png",
    });
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => new Uint8Array([1, 2, 3, 4]).buffer,
    });
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        Response.json({
          document_id: documentId,
          status: "awaiting_upload",
          version: 1,
          upload: {
            method: "PUT",
            url: "http://storage.test/private-upload",
            headers: { "content-type": "image/png", "x-amz-meta-expected-byte-length": "4" },
            expires_at: "2026-09-20T12:05:00Z",
          },
        })
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        Response.json({ document_id: documentId, status: "validating", version: 2 })
      )
      .mockResolvedValueOnce(
        Response.json({
          message_id: "55555555-5555-4555-8555-555555555555",
          run_id: runId,
          status: "queued",
          events_url: `/api/v1/businesses/${businessId}/runs/${runId}/events`,
        })
      );

    const accepted = await chat.uploadReceipt(businessId, conversationId, file);

    expect(accepted.run_id).toBe(runId);
    const [uploadUrl, uploadOptions] = vi.mocked(global.fetch).mock.calls[1];
    expect(uploadUrl).toBe("http://storage.test/private-upload");
    expect(uploadOptions?.method).toBe("PUT");
    expect(uploadOptions?.body).toBe(file);
    const [startUrl, startOptions] = vi.mocked(global.fetch).mock.calls[3];
    expect(startUrl).toBe(
      `/agent/api/v1/businesses/${businessId}/documents/${documentId}/receipt-runs`
    );
    expect(JSON.parse(String(startOptions?.body))).toEqual({
      conversation_id: conversationId,
      locale: "en-CA",
    });
  });
});
