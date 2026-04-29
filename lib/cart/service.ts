import {
  readArray,
  readBoolean,
  readNullableString,
  readNumber,
  pickFirstValue,
  readRecord,
  readString,
  unwrapApiResponse,
} from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";

import type { CartState } from "./types";
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

function readOptionalStock(record: ReturnType<typeof readRecord>) {
  const stockKeys = [
    "stock",
    "inventory",
    "availableStock",
    "availableQuantity",
    "remainingStock",
    "remainingQuantity",
  ];
  const value = pickFirstValue(record, stockKeys);
  if (value === undefined || value === null) {
    return null;
  }

  return Math.max(0, readNumber(record, stockKeys, 0));
}

export function normalizeCartState(raw: unknown): CartState {
  const record = readRecord(raw) ?? {};
  const items = readArray(record.items ?? record.cartItems).map((entry) => {
    const itemRecord = readRecord(entry) ?? {};
    const productRecord =
      readRecord(itemRecord.product) ??
      readRecord(itemRecord.item) ??
      readRecord(itemRecord.productInfo) ??
      {};

    return {
      cartItemId: readNullableString(itemRecord, ["cartItemId", "id"]) ?? undefined,
      id: readNullableString(itemRecord, ["id", "cartItemId"]) ?? undefined,
      quantity: readNumber(itemRecord, ["quantity", "count"], 1),
      product: {
        id: readString(productRecord, ["id", "productId"], ""),
        name: readString(productRecord, ["name", "title"], "장바구니 상품"),
        currentPrice: readNumber(
          productRecord,
          ["currentPrice", "salePrice", "price"],
          0,
        ),
        originalPrice: readNumber(
          productRecord,
          ["originalPrice", "price", "basePrice"],
          0,
        ),
        status: normalizeStatus(readString(productRecord, ["status"], "ON_SALE")),
        imageUrl: readNullableString(productRecord, ["imageUrl", "thumbnailUrl"]),
        dDay: readNumber(productRecord, ["dDay", "dday"], 0),
        discountRate: readNumber(productRecord, ["discountRate", "discountPercent"], 0),
        stock: readOptionalStock(productRecord),
      },
    };
  });
  const summaryRecord =
    readRecord(record.summary) ??
    readRecord(record.amounts) ??
    readRecord(record.paymentSummary) ??
    {};

  return {
    items,
    summary: {
      totalAmount: readNumber(summaryRecord, ["totalAmount", "totalPrice"], 0),
      discountAmount: readNumber(summaryRecord, ["discountAmount", "discountPrice"], 0),
      shippingFee: readNumber(summaryRecord, ["shippingFee", "deliveryFee"], 0),
      finalAmount: readNumber(summaryRecord, ["finalAmount", "paymentAmount"], 0),
    },
    priceChanged: readBoolean(record, ["priceChanged", "hasPriceChanged"], false),
  };
}

export async function getCart(token: string) {
  const response = await backendApi.get("/api/cart", { token });
  const data = unwrapApiResponse<unknown>(response, "장바구니를 불러오지 못했습니다.");
  return normalizeCartState(data);
}
