import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthApi } from "@/app/lib/api/auth";

describe("AuthApi business context", () => {
  const auth = new AuthApi("http://localhost:3000/api/v1");

  beforeEach(() => {
    vi.clearAllMocks();
    auth.setTokenProvider(async () => "test-token");
  });

  it("loads the authoritative membership role for a business", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        success: true,
        data: {
          user_id: "user-1",
          business_id: "business-1",
          membership_id: "membership-1",
          role: "owner",
          membership_version: 3,
        },
      }),
    } as Response);

    await expect(auth.getBusinessContext("business-1")).resolves.toMatchObject({
      role: "owner",
      membership_version: 3,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/businesses/business-1/auth-context",
      expect.any(Object)
    );
  });
});
