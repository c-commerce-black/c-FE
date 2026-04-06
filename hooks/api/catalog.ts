"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createExploreFilters,
  EXPLORE_PAGE_SIZE,
  type ExploreFilters,
  type ProductDetail,
  type ProductFeedPage,
  type ProductListData,
} from "@/lib/catalog";
import { appApi, unwrapApiResponse } from "@/lib/shared/api";

const CATALOG_QUERY_STALE_TIME = 30_000;

export const catalogQueryKeys = {
  homeProducts: () => ["catalog", "home-products"] as const,
  exploreFeed: (filters: ExploreFilters) => {
    const normalizedFilters = createExploreFilters(filters);
    return [
      "catalog",
      "explore-feed",
      normalizedFilters.category,
      normalizedFilters.sort,
      normalizedFilters.q,
    ] as const;
  },
  productDetail: (id: string) => ["catalog", "product-detail", id] as const,
};

async function fetchExploreFeedPage({
  page,
  filters,
}: {
  page: number;
  filters: ExploreFilters;
}) {
  const normalizedFilters = createExploreFilters(filters);
  const response = await appApi.get("/api/products/feed", {
    params: {
      page,
      limit: EXPLORE_PAGE_SIZE,
      sort: normalizedFilters.sort,
      category: normalizedFilters.category || undefined,
      q: normalizedFilters.q || undefined,
    },
  });

  return unwrapApiResponse<ProductFeedPage>(
    response,
    "상품을 더 불러오지 못했습니다.",
  );
}

export function useAddProductToCartMutation() {
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const response = await appApi.post("/api/cart", { productId, quantity });
      unwrapApiResponse<unknown>(response, "장바구니에 담지 못했습니다.", {
        allowEmptySuccess: true,
      });
    },
  });
}

export function useCreateProductAlertMutation() {
  return useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      const response = await appApi.post("/api/alerts", { productId });
      unwrapApiResponse<unknown>(response, "찜 처리에 실패했습니다.");
    },
  });
}

export function useHomeProductsQuery() {
  return useQuery({
    queryKey: catalogQueryKeys.homeProducts(),
    staleTime: CATALOG_QUERY_STALE_TIME,
    queryFn: async () => {
      const response = await appApi.get("/api/products", {
        params: {
          limit: 8,
          sort: "expiry_asc",
        },
      });

      return unwrapApiResponse<ProductListData>(
        response,
        "상품 목록을 불러오지 못했습니다.",
      );
    },
  });
}

export function useExploreFeedQuery(filters: ExploreFilters) {
  const normalizedFilters = createExploreFilters(filters);

  return useQuery({
    queryKey: catalogQueryKeys.exploreFeed(normalizedFilters),
    staleTime: CATALOG_QUERY_STALE_TIME,
    queryFn: async () =>
      fetchExploreFeedPage({
        page: 1,
        filters: normalizedFilters,
      }),
  });
}

export function useProductDetailQuery(id: string) {
  return useQuery({
    queryKey: catalogQueryKeys.productDetail(id),
    staleTime: CATALOG_QUERY_STALE_TIME,
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await appApi.get(`/api/products/${id}`);
      return unwrapApiResponse<{ product: ProductDetail }>(
        response,
        "상품 정보를 불러오지 못했습니다.",
      );
    },
  });
}

export function useExploreFeedPageMutation() {
  return useMutation({
    mutationFn: async ({
      page,
      filters,
    }: {
      page: number;
      filters: ExploreFilters;
    }) => fetchExploreFeedPage({ page, filters }),
  });
}
