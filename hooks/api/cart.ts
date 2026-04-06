"use client";

import { useMutation } from "@tanstack/react-query";

import { appApi, unwrapApiResponse } from "@/lib/shared/api";

export function useUpdateCartItemQuantityMutation() {
  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      const response = await appApi.patch(`/api/cart/${itemId}`, { quantity });
      unwrapApiResponse<unknown>(response, "수량 변경에 실패했습니다.", {
        allowEmptySuccess: true,
      });
    },
  });
}

export function useDeleteCartItemMutation() {
  return useMutation({
    mutationFn: async ({ itemId }: { itemId: string }) => {
      const response = await appApi.delete(`/api/cart/${itemId}`);
      return unwrapApiResponse<{ message?: string }>(
        response,
        "장바구니 상품 삭제에 실패했습니다.",
        {
          allowEmptySuccess: true,
          emptyData: {},
        },
      );
    },
  });
}

export function useClearCartMutation() {
  return useMutation({
    mutationFn: async () => {
      const response = await appApi.delete("/api/cart");
      return unwrapApiResponse<{ message?: string }>(
        response,
        "장바구니를 비우지 못했습니다.",
        {
          allowEmptySuccess: true,
          emptyData: {},
        },
      );
    },
  });
}

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: async ({
      cartItemIds,
      shippingAddress,
    }: {
      cartItemIds: string[];
      shippingAddress: string;
    }) => {
      const response = await appApi.post("/api/orders", {
        cartItemIds,
        shippingAddress,
      });
      return unwrapApiResponse<{ order: { id: string } }>(
        response,
        "주문 생성에 실패했습니다.",
      );
    },
  });
}
