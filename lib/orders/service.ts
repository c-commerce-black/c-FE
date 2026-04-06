import {
  readArray,
  readNullableString,
  readNumber,
  readRecord,
  readString,
  readTimestamp,
  unwrapApiResponse,
} from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";
import type { Pagination } from "@/lib/shared/types";

import type { Order, SellerOrderStatus } from "./types";

const ORDER_STATUSES: Order["status"][] = [
  "PENDING",
  "PREPARING",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

function normalizeOrderStatus(value: string): Order["status"] {
  return ORDER_STATUSES.includes(value as Order["status"])
    ? (value as Order["status"])
    : "PENDING";
}

function normalizeOrder(raw: unknown): Order {
  const record = readRecord(raw) ?? {};

  return {
    id: readString(record, ["id", "orderId"], ""),
    status: normalizeOrderStatus(readString(record, ["status"], "PENDING")),
    totalAmount: readNumber(record, ["totalAmount", "totalPrice"], 0),
    discountAmount: readNumber(record, ["discountAmount", "discountPrice"], 0),
    shippingFee: readNumber(record, ["shippingFee", "deliveryFee"], 0),
    finalAmount: readNumber(record, ["finalAmount", "paymentAmount"], 0),
    shippingAddress: readString(record, ["shippingAddress", "address"], ""),
    createdAt: readTimestamp(record, ["createdAt", "createdDate"], Date.now()),
    updatedAt: readTimestamp(record, ["updatedAt", "updatedDate"], 0) || undefined,
    items: readArray(record.items ?? record.orderItems).map((entry) => {
      const itemRecord = readRecord(entry) ?? {};
      return {
        productId: readString(itemRecord, ["productId", "id"], ""),
        name: readString(itemRecord, ["name", "productName"], "주문 상품"),
        imageUrl: readNullableString(itemRecord, ["imageUrl", "thumbnailUrl"]),
        quantity: readNumber(itemRecord, ["quantity", "count"], 1),
        price: readNumber(itemRecord, ["price", "currentPrice", "salePrice"], 0),
        dDay: readNumber(itemRecord, ["dDay", "dday"], 0) || undefined,
      };
    }),
  };
}

function normalizePagination(
  raw: unknown,
  fallback: { page: number; limit: number; total: number; totalPages: number },
): Pagination {
  const record = readRecord(raw) ?? {};

  return {
    page: readNumber(record, ["page", "currentPage", "number"], fallback.page),
    limit: readNumber(record, ["limit", "size", "pageSize"], fallback.limit),
    total: readNumber(record, ["total", "totalCount", "count"], fallback.total),
    totalPages: readNumber(record, ["totalPages", "pageCount"], fallback.totalPages),
  };
}

export async function getOrders(
  token: string,
  query?: { page?: number; limit?: number },
) {
  const response = await backendApi.get("/api/orders", {
    token,
    params: query,
  });
  const data = unwrapApiResponse<unknown>(response, "주문 목록을 불러오지 못했습니다.");
  const record = readRecord(data) ?? {};
  const orders = readArray(record.orders ?? record.items ?? record.content).map(
    normalizeOrder,
  );

  return {
    orders,
    pagination: normalizePagination(record.pagination ?? record.pageInfo ?? record.meta, {
      page: query?.page ?? 1,
      limit: query?.limit ?? 20,
      total: orders.length,
      totalPages: 1,
    }),
  };
}

export async function getOrder(token: string, id: string) {
  const response = await backendApi.get(`/api/orders/${id}`, { token });
  const data = unwrapApiResponse<unknown>(response, "주문 정보를 불러오지 못했습니다.");
  const record = readRecord(data);

  return {
    order: normalizeOrder(record?.order ?? record?.item ?? data),
  };
}

export async function cancelOrder(token: string, id: string) {
  const response = await backendApi.patch(`/api/orders/${id}/cancel`, undefined, {
    token,
  });
  const data = unwrapApiResponse<unknown>(response, "주문 취소에 실패했습니다.");
  const record = readRecord(data);

  return {
    message: readString(record, ["message"], "주문이 취소되었습니다."),
  };
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
  const data = unwrapApiResponse<unknown>(response, "주문 상태 변경에 실패했습니다.");
  const record = readRecord(data);
  const orderRecord = readRecord(record?.order) ?? {};

  return {
    order: {
      id: readString(orderRecord, ["id", "orderId"], id),
      status: normalizeOrderStatus(readString(orderRecord, ["status"], status)),
      updatedAt: readTimestamp(orderRecord, ["updatedAt"], Date.now()),
    },
  };
}
