"use client";

import { useMutation } from "@tanstack/react-query";

import { appApi, unwrapApiResponse } from "@/lib/shared/api";

export function useCreateAlertMutation() {
  return useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      const response = await appApi.post("/api/alerts", { productId });
      return unwrapApiResponse<{ alert: { id: string; isOn: boolean } }>(
        response,
        "찜 처리에 실패했습니다.",
      );
    },
  });
}

export function useToggleAlertMutation() {
  return useMutation({
    mutationFn: async ({ alertId }: { alertId: string }) => {
      const response = await appApi.patch(`/api/alerts/${alertId}/toggle`);
      return unwrapApiResponse<{ alert: { isOn: boolean } }>(
        response,
        "알림 토글에 실패했습니다.",
      );
    },
  });
}

export function useDeleteAlertMutation() {
  return useMutation({
    mutationFn: async ({ alertId }: { alertId: string }) => {
      const response = await appApi.delete(`/api/alerts/${alertId}`);
      return unwrapApiResponse<{ message?: string }>(
        response,
        "알림 해제에 실패했습니다.",
        {
          allowEmptySuccess: true,
          emptyData: {},
        },
      );
    },
  });
}
