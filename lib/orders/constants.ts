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

export const ORDER_PAYMENT_STATUS_LABELS = {
  UNPAID: "결제 대기",
  FAILED: "결제 실패",
  PARTIAL: "부분 결제",
  PAID: "결제 완료",
} as const;
