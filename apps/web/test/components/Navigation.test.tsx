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
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("Accounting Engine")).toBeInTheDocument();
    expect(screen.getByText("Compliance")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/auth/login");
    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute("href", "/auth/register");
  });

  it("shows Open Dashboard action when user is already authenticated", () => {
    mocks.authenticated = true;

    render(<Navigation />);

    expect(screen.getByRole("link", { name: "Open Dashboard →" })).toHaveAttribute("href", "/dashboard");
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });

  it("opens and closes the mobile menu with accessible state", () => {
    render(<Navigation />);
    const toggle = screen.getByRole("button", { name: "Toggle navigation menu" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
