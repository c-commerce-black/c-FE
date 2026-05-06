"use client";

import { useMutation } from "@tanstack/react-query";

import type { TermsKey, User } from "@/lib/auth";
import { appApi, unwrapApiResponse } from "@/lib/shared/api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  nickname: string;
  email: string;
  password: string;
  shopName?: string;
  agreements: Record<TermsKey, boolean>;
};

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await appApi.post("/api/auth/login", payload, {
        fallbackMessage: "로그인에 실패했습니다.",
      });
      const data = unwrapApiResponse<{
        user?: User;
        accessToken?: string;
        expiresIn?: number;
      }>(response, "로그인에 실패했습니다.");

      return {
        user: data.user as User,
      };
    },
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      const response = await appApi.post("/api/auth/register", payload, {
        fallbackMessage: "회원가입에 실패했습니다.",
      });
      const data = unwrapApiResponse<{
        user?: User;
        accessToken?: string;
        expiresIn?: number;
      }>(response, "회원가입에 실패했습니다.");

      return {
        user: data.user as User,
      };
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: async () => {
      await appApi.post("/api/auth/logout");
    },
  });
}
