"use client";

import { useMutation } from "@tanstack/react-query";

import { appApi, unwrapApiResponse } from "@/lib/shared/api";

export type SellerProductPayload = {
  name: string;
  description: string;
  category: string;
  originalPrice: number;
  stock: number;
  expiryDate: string;
  imageUrl?: string;
};

export type CreateSellerProductPayload = SellerProductPayload;

export type UpdateSellerProductPayload = SellerProductPayload & {
  id: string;
};

export function useCreateSellerProductMutation() {
  return useMutation({
    mutationFn: async (payload: CreateSellerProductPayload) => {
      const response = await appApi.post("/api/seller/products", payload);
      unwrapApiResponse<unknown>(response, "상품 등록에 실패했습니다.", {
        allowEmptySuccess: true,
      });
    },
  });
}

export function useUpdateSellerProductMutation() {
  return useMutation({
    mutationFn: async (payload: UpdateSellerProductPayload) => {
      const response = await appApi.patch(`/api/seller/products/${payload.id}`, {
        name: payload.name,
        description: payload.description,
        category: payload.category,
        originalPrice: payload.originalPrice,
        stock: payload.stock,
        expiryDate: payload.expiryDate,
        imageUrl: payload.imageUrl || undefined,
      });
      return unwrapApiResponse<{ product?: Record<string, unknown> }>(
        response,
        "상품 수정에 실패했습니다.",
        {
          allowEmptySuccess: true,
          emptyData: {},
        },
      );
    },
  });
}

export function useDeleteSellerProductMutation() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await appApi.delete(`/api/seller/products/${id}`);
      unwrapApiResponse<unknown>(response, "상품 삭제에 실패했습니다.", {
        allowEmptySuccess: true,
      });
    },
  });
}

export function useImageUploadMutation() {
  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await appApi.post("/api/uploads/images", formData);
      const data = unwrapApiResponse<{
        imageUrl?: string;
        url?: string;
      }>(response, "이미지 업로드에 실패했습니다.");

      return {
        imageUrl: data.imageUrl ?? data.url ?? "",
      };
    },
  });
}
