import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Navigation } from "@/app/components/Navigation";

const mocks = vi.hoisted(() => ({
  pathname: "/",
  authenticated: false,
  loading: false,
  logout: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock("@/app/components/AuthProvider", () => ({
  useAuthContext: () => ({
    isAuthenticated: mocks.authenticated,
    isLoading: mocks.loading,
    logout: mocks.logout,
  }),
}));

vi.mock("@/app/components/ThemeLogo", () => ({
  ThemeLogo: () => <span>Oluto</span>,
}));

vi.mock("@/app/components/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

describe("Navigation", () => {
  beforeEach(() => {
    mocks.pathname = "/";
    mocks.authenticated = false;
    mocks.loading = false;
    vi.clearAllMocks();
  });

  it("shows marketing navigation and authentication actions to visitors", () => {
    render(<Navigation />);

    expect(screen.getByText("Oluto")).toBeInTheDocument();
    expect(screen.getByText("Agents")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/auth/login");
  });

  it("shows product navigation for an authenticated app page", () => {
    mocks.pathname = "/dashboard";
    mocks.authenticated = true;

    render(<Navigation />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "Chat with Oluto" })).toHaveAttribute("href", "/chat");
    expect(screen.getByRole("link", { name: "Daily Briefing" })).toHaveAttribute(
      "href",
      "/daily-briefings"
    );
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("makes Team & access available from the authenticated More menu", () => {
    mocks.pathname = "/settings/team";
    mocks.authenticated = true;

    render(<Navigation />);
    fireEvent.click(screen.getByRole("button", { name: "More" }));

    expect(screen.getByRole("menuitem", { name: "Team & access" })).toHaveAttribute(
      "href",
      "/settings/team"
    );
  });

  it("keeps authenticated navigation on the Daily Briefing page", () => {
    mocks.pathname = "/daily-briefings";
    mocks.authenticated = true;

    render(<Navigation />);

    expect(screen.getByRole("link", { name: "Daily Briefing" })).toHaveAttribute(
      "href",
      "/daily-briefings"
    );
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });

  it("opens and closes the mobile menu with accessible state", () => {
    render(<Navigation />);
    const toggle = screen.getByRole("button", { name: "Toggle menu" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("logs out from the authenticated navigation", () => {
    mocks.pathname = "/dashboard";
    mocks.authenticated = true;

    render(<Navigation />);
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(mocks.logout).toHaveBeenCalledOnce();
  });
});
