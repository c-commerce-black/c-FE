import { describe, expect, it } from "vitest";

import { SORT_OPTIONS } from "@/lib/constants";
import { normalizeProductFeedPage } from "@/lib/commerce";
import type { ProductListData } from "@/lib/types";

const productListFixture: ProductListData = {
  products: [
    {
      id: "prod-1",
      name: "유기농 사과",
      category: "FOOD",
      originalPrice: 10000,
      currentPrice: 7000,
      discountRate: 30,
      stock: 10,
      expiryDate: "2026-03-30",
      status: "ON_SALE",
      dDay: 2,
      imageUrl: null,
    },
    {
      id: "prod-2",
      name: "신선 바나나",
      category: "FOOD",
      originalPrice: 8000,
      currentPrice: 5000,
      discountRate: 38,
      stock: 8,
      expiryDate: "2026-03-29",
      status: "EXPIRY_SOON",
      dDay: 1,
      imageUrl: null,
    },
  ],
  pagination: {
    page: 1,
    limit: 2,
    total: 4,
    totalPages: 2,
  },
};

describe("commerce helpers", () => {
  it("supports every documented sort option in UI constants", () => {
    expect(SORT_OPTIONS.map((option) => option.value)).toEqual([
      "expiry_asc",
      "discount_desc",
      "price_asc",
      "price_desc",
    ]);
  });

  it("normalizes product feed pages from list payloads", () => {
    expect(normalizeProductFeedPage(productListFixture, "바나나")).toEqual({
      items: [productListFixture.products[1]],
      nextPage: 2,
      hasMore: true,
      total: 4,
    });
  });
});
