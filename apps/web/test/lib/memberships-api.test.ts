import { beforeEach, describe, expect, it, vi } from "vitest";
import { MembershipsApi } from "@/app/lib/api/memberships";

const businessId = "11111111-1111-4111-8111-111111111111";

describe("MembershipsApi", () => {
  const memberships = new MembershipsApi("http://localhost:3000/api/v1");

  beforeEach(() => {
    vi.clearAllMocks();
    memberships.setTokenProvider(async () => "test-token");
  });

  it("lists the members and invitations for a business", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true, data: [{ id: "membership-1" }] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true, data: [{ id: "invitation-1" }] }),
      } as Response);

    await expect(memberships.list(businessId)).resolves.toEqual([{ id: "membership-1" }]);
    await expect(memberships.listInvitations(businessId)).resolves.toEqual([
      { id: "invitation-1" },
    ]);

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      `http://localhost:3000/api/v1/businesses/${businessId}/memberships`,
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      `http://localhost:3000/api/v1/businesses/${businessId}/membership-invitations`,
      expect.any(Object)
    );
  });

  it("sends version-checked membership and invitation commands", async () => {
    vi.mocked(global.fetch).mockImplementation(
      async () =>
        ({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ success: true, data: {} }),
        }) as Response
    );

    await memberships.update(businessId, "membership-1", {
      role: "accountant",
      expected_version: 3,
    });
    await memberships.invite(businessId, {
      email: "person@example.com",
      role: "viewer",
    });
    await memberships.revokeInvitation(businessId, "invitation-1", 4);
    await memberships.retryInvitationDelivery(businessId, "invitation-1", 7);

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      `http://localhost:3000/api/v1/businesses/${businessId}/memberships/membership-1`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ role: "accountant", expected_version: 3 }),
      })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      `http://localhost:3000/api/v1/businesses/${businessId}/membership-invitations`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "person@example.com", role: "viewer" }),
      })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      3,
      `http://localhost:3000/api/v1/businesses/${businessId}/membership-invitations/invitation-1`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ expected_version: 4 }),
      })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      4,
      `http://localhost:3000/api/v1/businesses/${businessId}/membership-invitations/invitation-1/delivery/retry`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ expected_version: 7 }),
      })
    );
  });

  it("loads older audit events using the sequence cursor", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ success: true, data: { items: [], next_cursor: null } }),
    } as Response);

    await memberships.listAuditEvents(businessId, 42);

    expect(global.fetch).toHaveBeenCalledWith(
      `http://localhost:3000/api/v1/businesses/${businessId}/membership-audit-events?limit=50&before_sequence=42`,
      expect.any(Object)
    );
  });
});
