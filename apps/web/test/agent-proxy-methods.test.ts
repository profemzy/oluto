import { describe, expect, it } from "vitest";
import * as agentRoute from "@/app/agent/[...path]/route";

// The browser calls the Agent API through this Next.js proxy route.
// Next.js answers 405 for any HTTP method without an exported handler,
// so every method the generated AgentApiClient can send must be wired here.
// Missing DELETE broke conversation deletion with HTTP 405.
describe("agent proxy route methods", () => {
  it.each(["GET", "POST", "PATCH", "DELETE"] as const)("exports %s handler", (method) => {
    expect(typeof (agentRoute as Record<string, unknown>)[method]).toBe("function");
  });
});
