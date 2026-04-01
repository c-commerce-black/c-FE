import { unwrapApiResponse } from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";
import type { Pagination } from "@/lib/shared/types";

import type { Order, SellerOrderStatus } from "./types";

export async function getOrders(
  token: string,
  query?: { page?: number; limit?: number },
) {
  const response = await backendApi.get("/api/orders", {
    token,
    params: query,
  });
  return unwrapApiResponse<{ orders: Order[]; pagination: Pagination }>(
    response,
    "주문 목록을 불러오지 못했습니다.",
  );
}

export async function getOrder(token: string, id: string) {
  const response = await backendApi.get(`/api/orders/${id}`, { token });
  return unwrapApiResponse<{ order: Order }>(
    response,
    "주문 정보를 불러오지 못했습니다.",
  );
}

export async function cancelOrder(token: string, id: string) {
  const response = await backendApi.patch(`/api/orders/${id}/cancel`, undefined, {
    token,
  });
  return unwrapApiResponse<{ message: string }>(response, "주문 취소에 실패했습니다.");
}

export async function updateOrderStatus(
  token: string,
  id: string,
  status: SellerOrderStatus,
) {
  const response = await backendApi.patch(
    `/api/orders/${id}/status`,
    { status },
    {
      token,
    },
  );
  return unwrapApiResponse<{ order: Pick<Order, "id" | "status" | "updatedAt"> }>(
    response,
    "주문 상태 변경에 실패했습니다.",
  );
}
