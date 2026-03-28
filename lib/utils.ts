import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { OrderStatus, ProductStatus, SellerOrderStatus } from "@/lib/types";
import { ORDER_STATUS_STEPS } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function formatDate(value: string | number | Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function formatShortDate(value: string | number | Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(value));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getRemainSeconds(expiryDate?: string | null) {
  if (!expiryDate) return 0;
  const target = new Date(`${expiryDate}T23:59:59+09:00`).getTime();
  return Math.max(0, Math.floor((target - Date.now()) / 1000));
}

export function splitDuration(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  return { days, hours, minutes, seconds };
}

export function formatRemainTime(totalSeconds: number) {
  const { days, hours, minutes, seconds } = splitDuration(totalSeconds);
  if (days > 0) {
    return `D-${days} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
}

export function getProductStatusTone(status: ProductStatus) {
  switch (status) {
    case "EXPIRY_SOON":
      return "urgent";
    case "SOLD_OUT":
      return "muted";
    case "ON_SALE":
      return "accent";
    default:
      return "neutral";
  }
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

export function buildQueryString(
  values: Record<string, string | number | boolean | undefined | null>,
) {
  const searchParams = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function serializeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
