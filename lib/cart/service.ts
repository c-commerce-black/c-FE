import { backendApi, unwrapApiResponse } from "@/lib/shared/api";

import type { CartState } from "./types";

export async function getCart(token: string) {
  const response = await backendApi.get("/api/cart", { token });
  return unwrapApiResponse<CartState>(response, "장바구니를 불러오지 못했습니다.");
}
