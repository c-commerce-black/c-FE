"use client";

import { useQuery } from "@tanstack/react-query";

import type { WalletPaymentHistoryItem } from "@/lib/payments";
import { appApi, unwrapApiResponse } from "@/lib/shared/api";

const PAYMENT_HISTORY_QUERY_KEY = ["payment-history"] as const;

export function usePaymentHistoryQuery() {
  return useQuery({
    queryKey: PAYMENT_HISTORY_QUERY_KEY,
    queryFn: async () => {
      const response = await appApi.get("/api/payments/history", {
        fallbackMessage: "결제 기록을 불러오지 못했습니다.",
      });
      const data = unwrapApiResponse<{ payments?: WalletPaymentHistoryItem[] }>(
        response,
        "결제 기록을 불러오지 못했습니다.",
      );
      return data.payments ?? [];
    },
  });
}
