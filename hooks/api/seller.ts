"use client";

import { useMutation } from "@tanstack/react-query";

import type { SellerProduct } from "@/lib/seller";
import { appApi, unwrapApiResponse } from "@/lib/shared/api";

export type CreateSellerProductPayload = {
  name: string;
  category: string;
  originalPrice: number;
  stock: number;
  expiryDate: string;
  description: string;
  imageUrl?: string;
};

export type UpdateSellerProductPayload = {
  id: string;
  name: string;
  originalPrice: number;
  stock: number;
  expiryDate: string;
};

export function useCreateSellerProductMutation() {
  return useMutation({
    mutationFn: async (payload: CreateSellerProductPayload) => {
      const response = await appApi.post("/api/seller/products", payload);
      unwrapApiResponse<unknown>(response, "상품 등록에 실패했습니다.");
    },
  });
}

export function useUpdateSellerProductMutation() {
  return useMutation({
    mutationFn: async (payload: UpdateSellerProductPayload) => {
      const response = await appApi.patch(`/api/seller/products/${payload.id}`, {
        name: payload.name,
        originalPrice: payload.originalPrice,
        stock: payload.stock,
        expiryDate: payload.expiryDate,
      });
      return unwrapApiResponse<{
        product: Partial<
          Pick<SellerProduct, "name" | "currentPrice" | "stock" | "expiryDate">
        >;
      }>(
        response,
        "상품 수정에 실패했습니다.",
      );
    },
  });
}

export function useDeleteSellerProductMutation() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await appApi.delete(`/api/seller/products/${id}`);
      unwrapApiResponse<unknown>(response, "상품 삭제에 실패했습니다.");
    },
  });
}
