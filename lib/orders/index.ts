import { fetchBackend } from "@/lib/shared/api";
import type { Pagination } from "@/lib/shared/types";

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export type SellerOrderStatus = Exclude<OrderStatus, "PENDING" | "CANCELLED">;

export type OrderItem = {
  productId: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
  dDay?: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  shippingAddress: string;
  createdAt: number;
  updatedAt?: number;
  items: OrderItem[];
};

export const ORDER_STATUS_STEPS = [
  "PENDING",
  "PREPARING",
  "SHIPPING",
  "DELIVERED",
] as const;

export const ORDER_STATUS_LABELS = {
  PENDING: "주문완료",
  PREPARING: "준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "취소됨",
} as const;

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

export function getOrderStepIndex(status: OrderStatus) {
  const index = ORDER_STATUS_STEPS.indexOf(status as (typeof ORDER_STATUS_STEPS)[number]);
  return index === -1 ? 0 : index;
}

export function getNextSellerOrderStatus(
  status: OrderStatus,
): SellerOrderStatus | null {
  switch (status) {
    case "PENDING":
      return "PREPARING";
    case "PREPARING":
      return "SHIPPING";
    case "SHIPPING":
      return "DELIVERED";
    default:
      return null;
  }
}
