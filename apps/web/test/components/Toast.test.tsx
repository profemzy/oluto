import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Toast } from "@/app/components/ui/Toast";
import { toastError, toastInfo, toastPromise, toastSuccess, toastWarning } from "@/app/lib/toast";

const mocks = vi.hoisted(() => ({
  base: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  promise: vi.fn(),
  toaster: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: Object.assign(mocks.base, {
    error: mocks.error,
    success: mocks.success,
    promise: mocks.promise,
  }),
  Toaster: (props: unknown) => {
    mocks.toaster(props);
    return <div data-testid="toast-container" />;
  },
}));

vi.mock("@/app/components/ThemeProvider", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

describe("toast boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configures the shared toast container", () => {
    render(<Toast />);

    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
    expect(mocks.toaster).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "top-right",
        toastOptions: expect.objectContaining({ duration: 4000 }),
      })
    );
  });

  it("routes success, error, and informational messages", () => {
    toastSuccess("Saved");
    toastError("Failed");
    toastInfo("Working");

    expect(mocks.success).toHaveBeenCalledWith("Saved");
    expect(mocks.error).toHaveBeenCalledWith("Failed");
    expect(mocks.base).toHaveBeenCalledWith("Working");
  });

  it("adds warning presentation without changing the message", () => {
    toastWarning("Check this");

    expect(mocks.base).toHaveBeenCalledWith("Check this", expect.objectContaining({ icon: "⚠️" }));
  });

  it("delegates promise lifecycle messages", () => {
    const operation = Promise.resolve("done");
    mocks.promise.mockReturnValue(operation);

    expect(toastPromise(operation, "Loading", "Complete", "Failed")).toBe(operation);
    expect(mocks.promise).toHaveBeenCalledWith(operation, {
      loading: "Loading",
      success: "Complete",
      error: "Failed",
    });
  });
});
