import { cache } from "react";

import { fetchBackend } from "@/lib/backend";
import type {
  AlertItem,
  CartState,
  ExploreFilters,
  Order,
  Pagination,
  Product,
  ProductFeedPage,
  ProductDetail,
  ProductListData,
  ProductStatus,
  SellerOrderStatus,
  SellerProductsData,
  SellerProductsQuery,
  User,
} from "@/lib/types";
import { MOCK_PRODUCT_DETAILS, MOCK_PRODUCTS } from "@/lib/constants";

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

type ProductQueryOptions = {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
  status?: ProductStatus | "";
};

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

export async function getAlerts(token: string) {
  return fetchBackend<{ wishAlerts: AlertItem[]; todayDeals: AlertItem[] }>(
    "/api/alerts",
    { token },
  );
}

export async function getCart(token: string) {
  return fetchBackend<CartState>("/api/cart", { token });
}

export async function getOrders(
  token: string,
  query?: { page?: number; limit?: number },
) {
  return fetchBackend<{ orders: Order[]; pagination: Pagination }>("/api/orders", {
    token,
    query,
  });
}

export async function getOrder(token: string, id: string) {
  return fetchBackend<{ order: Order }>(`/api/orders/${id}`, { token });
}

export async function getSellerProducts(
  token: string,
  query?: SellerProductsQuery,
) {
  return fetchBackend<SellerProductsData>("/api/seller/products", {
    token,
    query,
  });
}

export async function getMe(token: string) {
  return fetchBackend<{ user: User }>("/api/auth/me", { token });
}

export function filterProducts(products: Product[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return products;
  return products.filter((product) =>
    product.name.toLowerCase().includes(normalized),
  );
}

export function createExploreFilters(
  filters: Partial<ExploreFilters> = {},
): ExploreFilters {
  return {
    category: filters.category ?? "",
    sort: filters.sort ?? "expiry_asc",
    q: filters.q ?? "",
  };
}

export async function getProductFeedPage({
  q = "",
  ...options
}: ProductQueryOptions & { q?: string }): Promise<ProductFeedPage> {
  const data = await getProductsPage(options);
  return normalizeProductFeedPage(data, q);
}

export function normalizeProductFeedPage(
  data: ProductListData,
  q = "",
): ProductFeedPage {
  const items = filterProducts(data.products, q);
  const hasMore = data.pagination.page < data.pagination.totalPages;

  return {
    items,
    nextPage: hasMore ? data.pagination.page + 1 : null,
    hasMore,
    total: data.pagination.total,
  };
}

export async function cancelOrder(token: string, id: string) {
  return fetchBackend<{ message: string }>(`/api/orders/${id}/cancel`, {
    method: "PATCH",
    token,
  });
}

export async function updateOrderStatus(
  token: string,
  id: string,
  status: SellerOrderStatus,
) {
  return fetchBackend<{ order: Pick<Order, "id" | "status" | "updatedAt"> }>(
    `/api/orders/${id}/status`,
    {
      method: "PATCH",
      token,
      body: { status },
    },
  );
}
