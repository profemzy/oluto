import { describe, expect, it } from "vitest";
import { getSectionTitle, navigationGroups } from "@/app/components/layout/navigation";
import { getRoleDisplay } from "@/app/components/layout/role";

describe("AppShell navigation extraction", () => {
  it("keeps all P0 sections in navigation groups", () => {
    const names = navigationGroups.flatMap((group) => group.items.map((item) => item.name));
    expect(names).toContain("Dashboard");
    expect(names).toContain("Transactions");
    expect(names).toContain("Invoices");
    expect(names).toContain("Bills");
    expect(names).toContain("Agent Operations");
  });

  it("resolves section titles from pathname", () => {
    expect(getSectionTitle("/dashboard")).toBe("Dashboard");
    expect(getSectionTitle("/transactions/123")).toBe("Transactions");
    expect(getSectionTitle("/invoices/new")).toBe("Invoices");
    expect(getSectionTitle("/bills/abc")).toBe("Bills");
    expect(getSectionTitle("/unknown")).toBe("Oluto Finance");
  });

  it("returns neutral loading state before role is confirmed", () => {
    expect(getRoleDisplay(null, true).label).toBe("Loading access...");
    expect(getRoleDisplay("accountant", false).label).toBe("Accountant");
    expect(getRoleDisplay("viewer", false).label).toBe("Viewer");
    expect(getRoleDisplay("owner", false).label).toBe("Owner");
  });
});
