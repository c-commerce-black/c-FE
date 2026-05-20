import type { ProductStatus } from "@/lib/catalog";
import {
  pickFirstValue,
  readArray,
  readBoolean,
  readNullableString,
  readNumber,
  readRecord,
  readString,
  type UnknownRecord,
} from "@/lib/shared/api";

import type { AlertItem, AlertsData } from "./types";

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

function readOptionalBoolean(
  source: UnknownRecord | null | undefined,
  keys: string[],
) {
  const value = pickFirstValue(source, keys);
  if (value === undefined || value === null) {
    return null;
  }

  return readBoolean(source, keys, false);
}

export function normalizeAlertItem(raw: unknown): AlertItem {
  const record = readRecord(raw) ?? {};
  const productRecord =
    readRecord(record.product) ??
    readRecord(record.item) ??
    readRecord(record.targetProduct) ??
    {};

  return {
    alertId: readNullableString(record, ["alertId", "id"]),
    isOn: readBoolean(record, ["isOn", "enabled", "active"], true),
    isRead: readOptionalBoolean(record, ["isRead", "read", "seen", "viewed"]),
    isTriggered: readBoolean(
      record,
      ["isTriggered", "triggered", "notified", "hasNotification", "isNew", "unread"],
      false,
    ),
    notifiedAt: readNullableString(record, [
      "notifiedAt",
      "triggeredAt",
      "alertedAt",
      "lastNotifiedAt",
      "updatedAt",
    ]),
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

export function normalizeAlertsData(raw: unknown): AlertsData {
  const record = readRecord(raw) ?? {};

  return {
    wishAlerts: readArray(record.wishAlerts ?? record.alerts ?? record.items).map(
      normalizeAlertItem,
    ),
    todayDeals: readArray(
      record.todayDeals ?? record.specialDeals ?? record.recommendedAlerts,
    ).map(normalizeAlertItem),
    unreadCount: readNumber(
      record,
      ["unreadCount", "newCount", "notificationCount", "unreadAlertCount"],
      0,
    ),
  };
}
