import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProductDetail } from "@/lib/catalog";

const { push, addToCart, createAlert } = vi.hoisted(() => ({
  push: vi.fn(),
  addToCart: vi.fn(),
  createAlert: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/hooks/api", () => ({
  useAddProductToCartMutation: () => ({
    mutateAsync: addToCart,
    isPending: false,
  }),
  useCreateProductAlertMutation: () => ({
    mutateAsync: createAlert,
    isPending: false,
  }),
}));

import { ProductDetailActions } from "@/components/catalog/product-detail-actions";

function createProduct(): ProductDetail {
  return {
    id: "prod-1",
    name: "대용량 샐러드",
    category: "FOOD",
    originalPrice: 2000,
    currentPrice: 1000,
    discountRate: 50,
    stock: 24,
    expiryDate: "2026-05-31",
    status: "ON_SALE",
    dDay: 3,
    imageUrl: null,
    description: null,
    seller: null,
    priceHistory: [],
  };
}

describe("ProductDetailActions", () => {
  beforeEach(() => {
    push.mockReset();
    addToCart.mockReset();
    createAlert.mockReset();
    addToCart.mockResolvedValue(undefined);
    createAlert.mockResolvedValue(undefined);
  });

  it("uses a directly typed bulk quantity when adding to cart", async () => {
    const user = userEvent.setup();
    render(
      <ProductDetailActions
        product={createProduct()}
        initialRemainSeconds={86_400}
      />,
    );

    const quantityInput = screen.getByLabelText("수량 직접 입력");
    await user.clear(quantityInput);
    await user.type(quantityInput, "12");

    expect(screen.getByText("₩12,000")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "지금 구매하기" }));

    await waitFor(() => {
      expect(addToCart).toHaveBeenCalledWith({
        productId: "prod-1",
        quantity: 12,
      });
    });
  });
});
