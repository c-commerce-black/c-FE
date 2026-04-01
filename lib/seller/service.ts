import { unwrapApiResponse } from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";

import type { SellerProductsData, SellerProductsQuery } from "./types";

export async function getSellerProducts(
  token: string,
  query?: SellerProductsQuery,
) {
  const response = await backendApi.get("/api/seller/products", {
    token,
    params: query,
  });
  return unwrapApiResponse<SellerProductsData>(
    response,
    "셀러 상품을 불러오지 못했습니다.",
  );
}
