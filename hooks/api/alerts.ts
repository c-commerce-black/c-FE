"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { normalizeAlertsData } from "@/lib/alerts/normalize";
import { appApi, unwrapApiResponse } from "@/lib/shared/api";

const ALERT_NOTIFICATION_REFETCH_INTERVAL = 60_000;
const ALERT_NOTIFICATION_STALE_TIME = 30_000;

export const alertsQueryKeys = {
  notification: () => ["alerts", "notification"] as const,
};

export function useAlertsNotificationQuery({
  enabled,
}: {
  enabled: boolean;
}) {
  return useQuery({
    queryKey: alertsQueryKeys.notification(),
    enabled,
    staleTime: ALERT_NOTIFICATION_STALE_TIME,
    refetchInterval: ALERT_NOTIFICATION_REFETCH_INTERVAL,
    queryFn: async () => {
      const response = await appApi.get("/api/alerts", {
        fallbackMessage: "알림 목록을 불러오지 못했습니다.",
      });
      const data = unwrapApiResponse<unknown>(
        response,
        "알림 목록을 불러오지 못했습니다.",
      );
      return normalizeAlertsData(data);
    },
  });
}

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
