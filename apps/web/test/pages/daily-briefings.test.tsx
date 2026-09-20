import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DailyBriefingsPage from "@/app/daily-briefings/page";

const mocks = vi.hoisted(() => ({
  listAutomations: vi.fn(),
  listDailyBriefings: vi.fn(),
  saveDailyBriefingSchedule: vi.fn(),
  success: vi.fn(),
}));

vi.mock("@/app/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { business_id: "11111111-1111-4111-8111-111111111111" },
    loading: false,
    timezone: "America/Vancouver",
    canAdmin: true,
  }),
}));

vi.mock("@/app/lib/api", () => ({
  api: {
    chat: {
      listAutomations: mocks.listAutomations,
      listDailyBriefings: mocks.listDailyBriefings,
      saveDailyBriefingSchedule: mocks.saveDailyBriefingSchedule,
    },
  },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: mocks.success },
}));

describe("DailyBriefingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listAutomations.mockResolvedValue([
      {
        id: "66666666-6666-4666-8666-666666666666",
        name: "Daily Finance Briefing",
        workflow_name: "daily_briefing",
        cron_expression: "30 8 * * *",
        time_zone_name: "America/Vancouver",
        locale: "en-CA",
        status: "active",
        version: 4,
      },
    ]);
    mocks.listDailyBriefings.mockResolvedValue([
      {
        run_id: "33333333-3333-4333-8333-333333333333",
        scheduled_for: "2026-09-20T15:30:00Z",
        locale: "en-CA",
        status: "succeeded",
        answer: "Cash is $12,450.00 CAD.",
      },
    ]);
    mocks.saveDailyBriefingSchedule.mockImplementation(
      async (_businessId: string, value: unknown) => value
    );
  });

  it("shows the schedule and durable briefing history", async () => {
    render(<DailyBriefingsPage />);

    expect(await screen.findByText("Cash is $12,450.00 CAD.")).toBeInTheDocument();
    expect(screen.getByLabelText("Delivery time")).toHaveValue("08:30");
    expect(screen.getByLabelText("Briefing language")).toHaveValue("en-CA");
    expect(screen.getByLabelText("Deliver every day")).toBeChecked();
    expect(screen.getByText(/America Vancouver/)).toBeInTheDocument();
  });

  it("saves the selected local time and language", async () => {
    render(<DailyBriefingsPage />);
    await screen.findByText("Cash is $12,450.00 CAD.");

    fireEvent.change(screen.getByLabelText("Delivery time"), { target: { value: "07:15" } });
    fireEvent.change(screen.getByLabelText("Briefing language"), {
      target: { value: "fr-CA" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save schedule" }));

    await waitFor(() => {
      expect(mocks.saveDailyBriefingSchedule).toHaveBeenCalledWith(
        "11111111-1111-4111-8111-111111111111",
        expect.objectContaining({
          cronExpression: "15 7 * * *",
          locale: "fr-CA",
          timeZoneName: "America/Vancouver",
          status: "active",
        })
      );
    });
    expect(mocks.success).toHaveBeenCalledWith("Daily Briefing schedule saved");
  });
});
