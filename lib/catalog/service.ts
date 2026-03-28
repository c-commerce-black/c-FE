import { cache } from "react";

import { fetchBackend } from "@/lib/shared/api";

import { MOCK_PRODUCT_DETAILS, MOCK_PRODUCTS } from "./mock-data";
import { normalizeProductFeedPage } from "./helpers";
import type {
  ProductDetail,
  ProductFeedPage,
  ProductListData,
  ProductStatus,
} from "./types";

type ProductQueryOptions = {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
  status?: ProductStatus | "";
};

function getMockProductsData({
  page = 1,
  limit = 8,
  category,
  sort = "expiry_asc",
}: {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
}) {
  const byCategory = category
    ? MOCK_PRODUCTS.filter((product) => product.category === category)
    : MOCK_PRODUCTS;
  const sorted = [...byCategory].sort((left, right) => {
    if (sort === "discount_desc") return right.discountRate - left.discountRate;
    if (sort === "price_asc") return left.currentPrice - right.currentPrice;
    if (sort === "price_desc") return right.currentPrice - left.currentPrice;
    return left.dDay - right.dDay;
  });
  const start = (page - 1) * limit;
  const sliced = sorted.slice(start, start + limit);

  return {
    products: sliced,
    pagination: {
      page,
      limit,
      total: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / limit)),
    },
  };
}

async function getProductsPage({
  page = 1,
  limit = 8,
  category,
  sort = "expiry_asc",
  status,
}: ProductQueryOptions) {
  try {
    return await fetchBackend<ProductListData>("/api/products", {
      query: {
        page,
        limit,
        category,
        sort,
        status,
      },
    });
  } catch {
    return getMockProductsData({
      page,
      limit,
      category,
      sort,
    });
  }
}

export const getProducts = cache(
  async (options: ProductQueryOptions) => getProductsPage(options),
);

export const getProductDetail = cache(async (id: string) => {
  try {
    return await fetchBackend<{ product: ProductDetail }>(`/api/products/${id}`);
  } catch {
    const fallback = MOCK_PRODUCT_DETAILS[id];
    if (!fallback) throw new Error("product-not-found");
    return { product: fallback };
  }
});

export async function getProductFeedPage({
  q = "",
  ...options
}: ProductQueryOptions & { q?: string }): Promise<ProductFeedPage> {
  const data = await getProductsPage(options);
  return normalizeProductFeedPage(data, q);
}
