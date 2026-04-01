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
      unwrapApiResponse<unknown>(response, "수량 변경에 실패했습니다.");
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
