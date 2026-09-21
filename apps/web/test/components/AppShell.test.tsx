import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/app/components/layout/AppShell";

const mocks = vi.hoisted(() => ({
  pathname: "/dashboard",
  user: {
    id: "user-1",
    email: "test@oluto.ca",
    full_name: "Jean Dupont",
    role: "accountant",
    is_active: true,
    business_id: "biz-1",
  },
  role: "accountant",
  canWrite: true,
  loading: false,
  logout: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/app/hooks/useAuth", () => ({
  useAuth: () => ({
    user: mocks.user,
    role: mocks.role,
    canWrite: mocks.canWrite,
    loading: mocks.loading,
    timezone: "America/Toronto",
  }),
}));

vi.mock("@/app/components/AuthProvider", () => ({
  useAuthContext: () => ({
    logout: mocks.logout,
  }),
}));

vi.mock("@/app/components/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

describe("AppShell", () => {
  beforeEach(() => {
    mocks.pathname = "/dashboard";
    mocks.role = "accountant";
    mocks.canWrite = true;
    mocks.loading = false;
    vi.clearAllMocks();
  });

  it("renders desktop sidebar navigation groups and branding", () => {
    render(<AppShell><div>Dashboard Content</div></AppShell>);

    expect(screen.getAllByText("Oluto").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Daily Briefing").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Agent Operations").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Invoices").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Team & Access").length).toBeGreaterThan(0);
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
  });

  it("shows Add Transaction button when user has canWrite permission", () => {
    mocks.canWrite = true;
    mocks.role = "accountant";

    render(<AppShell><div>Content</div></AppShell>);

    expect(screen.getByRole("link", { name: /Add Transaction/i })).toHaveAttribute("href", "/transactions/new");
  });

  it("strictly hides Add Transaction button and shows Viewer badge when user is a viewer", () => {
    mocks.canWrite = false;
    mocks.role = "viewer";

    render(<AppShell><div>Content</div></AppShell>);

    expect(screen.queryByRole("link", { name: /Add Transaction/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Viewer \(Read-Only\)/i)).toBeInTheDocument();
  });

  it("calls logout when Sign Out is clicked", () => {
    render(<AppShell><div>Content</div></AppShell>);

    const signOutBtns = screen.getAllByRole("button", { name: /Sign Out/i });
    fireEvent.click(signOutBtns[0]);

    expect(mocks.logout).toHaveBeenCalledOnce();
  });
});
