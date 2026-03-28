import { fetchBackend } from "@/lib/shared/api";

import type { SellerProductsData, SellerProductsQuery } from "./types";

export async function getSellerProducts(
  token: string,
  query?: SellerProductsQuery,
) {
  return fetchBackend<SellerProductsData>("/api/seller/products", {
    token,
    query,
  });
}
