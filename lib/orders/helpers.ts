import { ORDER_STATUS_STEPS } from "./constants";
import type { OrderStatus, SellerOrderStatus } from "./types";

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
