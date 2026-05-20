import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CartState } from "@/lib/cart";
import { useCheckoutStore } from "@/stores/checkout-store";

const {
  push,
  refresh,
  updateQuantity,
  deleteCartItem,
  clearCart,
  createOrder,
} = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  updateQuantity: vi.fn(),
  deleteCartItem: vi.fn(),
  clearCart: vi.fn(),
  createOrder: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/hooks/api", () => ({
  useUpdateCartItemQuantityMutation: () => ({
    mutateAsync: updateQuantity,
    isPending: false,
  }),
  useDeleteCartItemMutation: () => ({
    mutateAsync: deleteCartItem,
    isPending: false,
  }),
  useClearCartMutation: () => ({
    mutateAsync: clearCart,
    isPending: false,
  }),
  useCreateOrderMutation: () => ({
    mutateAsync: createOrder,
    isPending: false,
  }),
}));

import { CartClient } from "@/components/cart/cart-client";

function createCart(): CartState {
  return {
    items: [
      {
        cartItemId: "cart-1",
        id: "cart-1",
        quantity: 1,
        product: {
          id: "prod-1",
          name: "샐러드",
          currentPrice: 5000,
          originalPrice: 10000,
          status: "ON_SALE",
          imageUrl: null,
          dDay: 1,
          discountRate: 50,
          stock: 3,
        },
      },
    ],
    summary: {
      totalAmount: 10000,
      discountAmount: 5000,
      shippingFee: 0,
      finalAmount: 5000,
    },
    priceChanged: false,
  };
}

describe("CartClient", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    updateQuantity.mockReset();
    deleteCartItem.mockReset();
    clearCart.mockReset();
    createOrder.mockReset();
    updateQuantity.mockResolvedValue(undefined);
    useCheckoutStore.setState({
      shippingAddress: "",
      selectedCartItemIds: [],
      showPriceToast: false,
    });
  });

  it("renders the backend cart summary before local cart changes", () => {
    render(<CartClient initialCart={createCart()} />);

    expect(screen.getByText("배송비").nextElementSibling).toHaveTextContent("₩0");
    expect(screen.getByText("총 결제금액").nextElementSibling).toHaveTextContent(
      "₩5,000",
    );
  });

  it("keeps the backend shipping fee rule when recalculating after local quantity changes", async () => {
    render(<CartClient initialCart={createCart()} />);

    await userEvent.click(screen.getByRole("button", { name: "수량 증가" }));

    await waitFor(() => {
      expect(updateQuantity).toHaveBeenCalledWith({
        itemId: "cart-1",
        quantity: 2,
      });
    });
    expect(screen.getByText("배송비").nextElementSibling).toHaveTextContent("₩0");
    expect(screen.getByText("총 결제금액").nextElementSibling).toHaveTextContent(
      "₩10,000",
    );
  });

  it("commits a directly typed cart quantity with Enter", async () => {
    const user = userEvent.setup();
    render(<CartClient initialCart={createCart()} />);

    const quantityInput = screen.getByLabelText("샐러드 수량 직접 입력");
    await user.clear(quantityInput);
    await user.type(quantityInput, "3{Enter}");

    await waitFor(() => {
      expect(updateQuantity).toHaveBeenCalledWith({
        itemId: "cart-1",
        quantity: 3,
      });
    });
    expect(screen.getByText("총 결제금액").nextElementSibling).toHaveTextContent(
      "₩15,000",
    );
  });

  it("caps bulk cart increments at the available stock", async () => {
    const user = userEvent.setup();
    render(<CartClient initialCart={createCart()} />);

    await user.click(screen.getByRole("button", { name: "샐러드 수량 5개 추가" }));

    await waitFor(() => {
      expect(updateQuantity).toHaveBeenCalledWith({
        itemId: "cart-1",
        quantity: 3,
      });
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "샐러드 구매 가능 수량은 3개입니다.",
    );
  });
});
