"use client";

import { useMutation } from "@tanstack/react-query";

import type { OrderStatus, SellerOrderStatus } from "@/lib/orders";
import { appApi, unwrapApiResponse } from "@/lib/shared/api";

export function useCancelOrderMutation() {
  return useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      const response = await appApi.patch(`/api/orders/${orderId}/cancel`);
      return unwrapApiResponse<{ message?: string }>(
        response,
        "주문 취소에 실패했습니다.",
      );
    },
  });
}

export function useUpdateOrderStatusMutation() {
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: SellerOrderStatus;
    }) => {
      const response = await appApi.patch(`/api/orders/${orderId}/status`, {
        status,
      });
      return unwrapApiResponse<{ order: { status: OrderStatus } }>(
        response,
        "주문 상태 변경에 실패했습니다.",
      );
    },
  });
}
