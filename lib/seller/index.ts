import { fetchBackend } from "@/lib/shared/api";
import type { Pagination } from "@/lib/shared/types";
import type { ProductStatus } from "@/lib/catalog";
import type { SellerOrderStatus } from "@/lib/orders";

export type SellerProduct = {
  id: string;
  name: string;
  currentPrice: number;
  stock: number;
  expiryDate: string;
  status: ProductStatus;
  todaySoldCount: number;
};

export type SellerProductsData = {
  todaySales: number;
  stats: {
    onSale: number;
    expirySoon: number;
    todayOrders: number;
  };
  products: SellerProduct[];
  pagination: Pagination;
};

export type SellerProductsQuery = {
  page?: number;
  limit?: number;
};

export const SELLER_ORDER_STATUS_OPTIONS = [
  { value: "PREPARING", label: "배송 준비" },
  { value: "SHIPPING", label: "배송 중" },
  { value: "DELIVERED", label: "배송 완료" },
] as const satisfies ReadonlyArray<{
  value: SellerOrderStatus;
  label: string;
}>;

export const SELLER_EDITABLE_FIELDS = [
  { key: "name", label: "상품명", type: "text" },
  { key: "originalPrice", label: "가격", type: "number" },
  { key: "stock", label: "재고", type: "number" },
  { key: "expiryDate", label: "유통기한", type: "date" },
] as const;

export async function getSellerProducts(
  token: string,
  query?: SellerProductsQuery,
) {
  return fetchBackend<SellerProductsData>("/api/seller/products", {
    token,
    query,
  });
}
