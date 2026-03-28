import type { SellerOrderStatus } from "@/lib/orders";

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
