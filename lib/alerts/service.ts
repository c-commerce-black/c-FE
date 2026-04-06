import {
  readArray,
  readBoolean,
  readNullableString,
  readNumber,
  readRecord,
  readString,
  unwrapApiResponse,
} from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";

import type { AlertItem } from "./types";
import type { ProductStatus } from "@/lib/catalog";

const PRODUCT_STATUSES: ProductStatus[] = [
  "ON_SALE",
  "EXPIRY_SOON",
  "SOLD_OUT",
  "EXPIRED",
  "DELETED",
];

function normalizeStatus(value: string): ProductStatus {
  return PRODUCT_STATUSES.includes(value as ProductStatus)
    ? (value as ProductStatus)
    : "ON_SALE";
}

function normalizeAlertItem(raw: unknown): AlertItem {
  const record = readRecord(raw) ?? {};
  const productRecord =
    readRecord(record.product) ??
    readRecord(record.item) ??
    readRecord(record.targetProduct) ??
    {};

  return {
    alertId: readNullableString(record, ["alertId", "id"]),
    isOn: readBoolean(record, ["isOn", "enabled", "active"], true),
    product: {
      id: readString(productRecord, ["id", "productId"], ""),
      name: readString(productRecord, ["name", "title"], "알림 상품"),
      currentPrice: readNumber(productRecord, ["currentPrice", "salePrice", "price"], 0),
      status: normalizeStatus(readString(productRecord, ["status"], "ON_SALE")),
      remainSeconds: readNumber(
        productRecord,
        ["remainSeconds", "remainingSeconds", "remainingTime"],
        0,
      ),
      imageUrl: readNullableString(productRecord, ["imageUrl", "thumbnailUrl"]),
    },
  };
}

export async function getAlerts(token: string) {
  const response = await backendApi.get("/api/alerts", {
    token,
  });
  const data = unwrapApiResponse<unknown>(response, "알림 목록을 불러오지 못했습니다.");
  const record = readRecord(data) ?? {};

  return {
    wishAlerts: readArray(record.wishAlerts ?? record.alerts ?? record.items).map(
      normalizeAlertItem,
    ),
    todayDeals: readArray(
      record.todayDeals ?? record.specialDeals ?? record.recommendedAlerts,
    ).map(normalizeAlertItem),
  };
}
