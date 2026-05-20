import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AlertsData } from "@/lib/alerts";
import { useAuthStore } from "@/stores/auth-store";

const { usePathname, useAlertsNotificationQuery } = vi.hoisted(() => ({
  usePathname: vi.fn(),
  useAlertsNotificationQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname,
}));

vi.mock("@/hooks/api", () => ({
  useAlertsNotificationQuery,
}));

import { StoreShell } from "@/components/shared/layout/store-shell";

function createAlertsData(): AlertsData {
  return {
    wishAlerts: [
      {
        alertId: "alert-1",
        isOn: true,
        isRead: false,
        isTriggered: false,
        notifiedAt: "2026-05-20T08:00:00.000Z",
        product: {
          id: "prod-1",
          name: "샐러드",
          currentPrice: 4500,
          status: "EXPIRY_SOON",
          remainSeconds: 3600,
          imageUrl: null,
        },
      },
    ],
    todayDeals: [],
    unreadCount: 0,
  };
}

describe("StoreShell", () => {
  beforeEach(() => {
    window.localStorage.clear();
    usePathname.mockReset();
    usePathname.mockReturnValue("/");
    useAlertsNotificationQuery.mockReset();
    useAlertsNotificationQuery.mockReturnValue({
      data: createAlertsData(),
    });
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "user@example.com",
        nickname: "사용자",
        sellerProfileId: "seller-1",
      },
    });
  });

  it("shows a red dot on the alerts nav item when new alerts exist", () => {
    render(
      <StoreShell>
        <div>content</div>
      </StoreShell>,
    );

    expect(
      screen.getByRole("link", { name: "알림, 새 알림 있음" }),
    ).toBeVisible();
  });

  it("marks the current alert signal as seen on the alerts page", async () => {
    usePathname.mockReturnValue("/alerts");

    render(
      <StoreShell>
        <div>content</div>
      </StoreShell>,
    );

    await waitFor(() => {
      expect(
        window.localStorage.getItem("cc_seen_alert_signal:user-1"),
      ).toBe("alert-1:2026-05-20T08:00:00.000Z");
    });
    expect(screen.getByRole("link", { name: "알림" })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "알림, 새 알림 있음" }),
    ).not.toBeInTheDocument();
  });
});
