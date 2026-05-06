import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SellerProductsData } from "@/lib/seller";

const { deleteProduct } = vi.hoisted(() => ({
  deleteProduct: vi.fn(),
}));

vi.mock("@/hooks/api", () => ({
  useDeleteSellerProductMutation: () => ({
    mutateAsync: deleteProduct,
    isPending: false,
  }),
}));

import { SellerDashboardClient } from "@/components/seller/seller-dashboard-client";

function createSellerData(): SellerProductsData {
  return {
    todaySales: 55000,
    stats: {
      onSale: 1,
      expirySoon: 1,
      todayOrders: 0,
    },
    products: [
      {
        id: "prod-expiry",
        name: "임박 샐러드",
        description: "오늘 입고",
        category: "FOOD",
        originalPrice: 9000,
        currentPrice: 7000,
        stock: 8,
        expiryDate: "2026-04-12",
        imageUrl: null,
        status: "EXPIRY_SOON",
        todaySoldCount: 3,
      },
      {
        id: "prod-sold-out",
        name: "품절 주스",
        description: "판매 완료",
        category: "DRINK",
        originalPrice: 5000,
        currentPrice: 3000,
        stock: 0,
        expiryDate: "2026-04-12",
        imageUrl: null,
        status: "SOLD_OUT",
        todaySoldCount: 10,
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    },
  };
}

describe("SellerDashboardClient", () => {
  beforeEach(() => {
    deleteProduct.mockReset();
    deleteProduct.mockResolvedValue({});
  });

  it("renders product status labels from each product status", () => {
    render(<SellerDashboardClient initialData={createSellerData()} />);

    expect(screen.getByText("임박특가")).toBeVisible();
    expect(screen.getByText("품절")).toBeVisible();
  });

  it("updates the matching status stat after deleting an expiry-soon product", async () => {
    render(<SellerDashboardClient initialData={createSellerData()} />);

    await userEvent.click(screen.getAllByRole("button", { name: "삭제" })[0]);
    await userEvent.click(screen.getAllByRole("button", { name: "삭제" }).at(-1)!);

    expect(deleteProduct).toHaveBeenCalledWith({ id: "prod-expiry" });
    expect(screen.queryByText("임박 샐러드")).toBeNull();
    expect(screen.getByText("품절 주스")).toBeVisible();
  });
});
