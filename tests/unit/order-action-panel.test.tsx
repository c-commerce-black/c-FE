import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrderActionPanel } from "@/components/orders/order-action-panel";

const { refresh, requestApi } = vi.hoisted(() => ({
  refresh: vi.fn(),
  requestApi: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
  }),
}));

vi.mock("@/lib/shared/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/shared/api")>(
    "@/lib/shared/api",
  );

  return {
    ...actual,
    requestApi,
  };
});

describe("OrderActionPanel", () => {
  beforeEach(() => {
    refresh.mockReset();
    requestApi.mockReset();
  });

  it("shows cancel and next status actions for pending orders", () => {
    render(<OrderActionPanel orderId="order123" status="PENDING" canCancel />);

    expect(screen.getByRole("button", { name: "주문 취소" })).toBeVisible();
    expect(screen.getByRole("button", { name: "준비중로 변경" })).toBeVisible();
  });

  it("surfaces backend authorization errors from status changes", async () => {
    requestApi.mockResolvedValue({
      ok: false,
      status: 403,
      payload: {
        success: false,
        error: {
          message: "본인 상품 주문만 변경할 수 있습니다.",
          statusCode: 403,
        },
      },
    });

    render(<OrderActionPanel orderId="order123" status="PREPARING" canCancel={false} />);

    await userEvent.click(screen.getByRole("button", { name: "배송중로 변경" }));

    expect(
      await screen.findByText("본인 상품 주문만 변경할 수 있습니다."),
    ).toBeVisible();
  });
});
