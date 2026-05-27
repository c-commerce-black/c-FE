"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PaymentProfile } from "@/lib/payments";
import { appApi, unwrapApiResponse } from "@/lib/shared/api";

const PAYMENT_PROFILE_QUERY_KEY = ["payment-profile"] as const;
const PAYMENT_HISTORY_QUERY_KEY = ["payment-history"] as const;

export function usePaymentProfileQuery() {
  return useQuery({
    queryKey: PAYMENT_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const response = await appApi.get("/api/payments/profile", {
        fallbackMessage: "결제 지갑 정보를 불러오지 못했습니다.",
      });
      const data = unwrapApiResponse<{ paymentProfile?: PaymentProfile | null }>(
        response,
        "결제 지갑 정보를 불러오지 못했습니다.",
      );

      return data.paymentProfile ?? null;
    },
  });
}

export function useUpsertPaymentProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await appApi.post("/api/payments/profile", {});

      const data = unwrapApiResponse<{ paymentProfile?: PaymentProfile | null }>(
        response,
        "결제 지갑 정보를 준비하지 못했습니다.",
      );

      return data.paymentProfile ?? null;
    },
    onSuccess: (paymentProfile) => {
      queryClient.setQueryData(PAYMENT_PROFILE_QUERY_KEY, paymentProfile);
      void queryClient.invalidateQueries({ queryKey: PAYMENT_HISTORY_QUERY_KEY });
    },
  });
}
