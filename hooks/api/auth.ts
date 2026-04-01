"use client";

import { useMutation } from "@tanstack/react-query";

import type { User } from "@/lib/auth";
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
};

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await appApi.post("/api/auth/login", payload);
      return unwrapApiResponse<{ user: User }>(
        response,
        "로그인에 실패했습니다.",
      );
    },
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      const response = await appApi.post("/api/auth/register", payload);
      return unwrapApiResponse<{ user: User }>(
        response,
        "회원가입에 실패했습니다.",
      );
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
