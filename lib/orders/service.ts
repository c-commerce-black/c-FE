import { fetchBackend } from "@/lib/shared/api";
import type { Pagination } from "@/lib/shared/types";

import type { Order, SellerOrderStatus } from "./types";

export async function getOrders(
  token: string,
  query?: { page?: number; limit?: number },
) {
  return fetchBackend<{ orders: Order[]; pagination: Pagination }>("/api/orders", {
    token,
    query,
  });
}

export async function getOrder(token: string, id: string) {
  return fetchBackend<{ order: Order }>(`/api/orders/${id}`, { token });
}

export async function cancelOrder(token: string, id: string) {
  return fetchBackend<{ message: string }>(`/api/orders/${id}/cancel`, {
    method: "PATCH",
    token,
  });
}

export async function updateOrderStatus(
  token: string,
  id: string,
  status: SellerOrderStatus,
) {
  return fetchBackend<{ order: Pick<Order, "id" | "status" | "updatedAt"> }>(
    `/api/orders/${id}/status`,
    {
      method: "PATCH",
      token,
      body: { status },
    },
  );
}
