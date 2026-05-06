import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrderActionPanel } from "@/components/orders/order-action-panel";

const { refresh, mutateAsync } = vi.hoisted(() => ({
  refresh: vi.fn(),
  mutateAsync: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
  }),
}));

vi.mock("@/hooks/api", () => ({
  useCancelOrderMutation: () => ({
    mutateAsync,
    isPending: false,
  }),
  useUpdateOrderStatusMutation: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

describe("OrderActionPanel", () => {
  beforeEach(() => {
    refresh.mockReset();
    mutateAsync.mockReset();
  });

  it("shows cancel and next status actions for pending orders", () => {
    render(
      <OrderActionPanel
        orderId="order123"
        status="PENDING"
        canCancel
        canUpdateStatus
      />,
    );

    expect(screen.getByRole("button", { name: "주문 취소" })).toBeVisible();
    expect(screen.getByRole("button", { name: "준비중로 변경" })).toBeVisible();
  });

  it("hides seller status actions by default on buyer order pages", () => {
    render(<OrderActionPanel orderId="order123" status="PREPARING" canCancel={false} />);

    expect(screen.queryByRole("button", { name: "배송중로 변경" })).toBeNull();
  });

  it("surfaces backend authorization errors from status changes", async () => {
    mutateAsync.mockRejectedValue({
      response: {
        status: 403,
        data: {
          success: false,
          error: {
            message: "본인 상품 주문만 변경할 수 있습니다.",
            statusCode: 403,
          },
        },
        headers: { "content-type": "application/json" },
      },
      isAxiosError: true,
    });

    render(
      <OrderActionPanel
        orderId="order123"
        status="PREPARING"
        canCancel={false}
        canUpdateStatus
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "배송중로 변경" }));

    expect(
      await screen.findByText("본인 상품 주문만 변경할 수 있습니다."),
    ).toBeVisible();
  });
});
