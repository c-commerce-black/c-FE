import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import type { ProductListData } from "@/lib/catalog";

const { getProducts } = vi.hoisted(() => ({
  getProducts: vi.fn(),
}));

vi.mock("@/lib/catalog", async () => {
  const actual = await vi.importActual<typeof import("@/lib/catalog")>(
    "@/lib/catalog",
  );

  return {
    ...actual,
    getProducts,
  };
});

import { GET } from "@/app/api/products/route";

const productsFixture: ProductListData = {
  products: [],
  pagination: {
    page: 2,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

describe("/api/products route", () => {
  it("uses the documented default limit when the query is omitted", async () => {
    getProducts.mockResolvedValue(productsFixture);

    const response = await GET(
      new NextRequest("http://localhost:3000/api/products?page=2"),
    );

    expect(getProducts).toHaveBeenCalledWith({
      page: 2,
      limit: 20,
      category: "",
      sort: "expiry_asc",
      status: "",
    });
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: productsFixture,
    });
  });
});
