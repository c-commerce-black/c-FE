"use client";

import { useMutation } from "@tanstack/react-query";

import {
  EXPLORE_PAGE_SIZE,
  type ExploreFilters,
  type Product,
} from "@/lib/catalog";
import { appApi, unwrapApiResponse } from "@/lib/shared/api";

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
      unwrapApiResponse<unknown>(response, "장바구니에 담지 못했습니다.");
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

export function useExploreFeedPageMutation() {
  return useMutation({
    mutationFn: async ({
      page,
      filters,
    }: {
      page: number;
      filters: ExploreFilters;
    }) => {
      const search = new URLSearchParams({
        page: String(page),
        limit: String(EXPLORE_PAGE_SIZE),
        sort: filters.sort,
      });

      if (filters.category) search.set("category", filters.category);
      if (filters.q) search.set("q", filters.q);

      const response = await appApi.get(`/api/products/feed?${search.toString()}`);
      return unwrapApiResponse<{
        items: Product[];
        nextPage: number | null;
        hasMore: boolean;
        total: number;
      }>(
        response,
        "상품을 더 불러오지 못했습니다.",
      );
    },
  });
}
