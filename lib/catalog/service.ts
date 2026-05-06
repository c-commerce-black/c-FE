import { cache } from "react";

import {
  readArray,
  readNullableString,
  readNumber,
  readRecord,
  readString,
  unwrapApiResponse,
} from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";
import { normalizeProductFeedPage } from "./helpers";
import type {
  ProductDetail,
  ProductFeedPage,
  ProductListData,
  ProductCategory,
  ProductStatus,
  SellerPreview,
} from "./types";

type ProductQueryOptions = {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
  status?: ProductStatus | "";
  q?: string;
};

const PRODUCT_CATEGORIES: ProductCategory[] = [
  "FOOD",
  "BEAUTY",
  "DRINK",
  "MEAL_KIT",
  "OTHER",
];

const PRODUCT_STATUSES: ProductStatus[] = [
  "ON_SALE",
  "EXPIRY_SOON",
  "SOLD_OUT",
  "EXPIRED",
  "DELETED",
];

function normalizeCategory(value: string): ProductCategory {
  return PRODUCT_CATEGORIES.includes(value as ProductCategory)
    ? (value as ProductCategory)
    : "OTHER";
}

function normalizeStatus(value: string): ProductStatus {
  return PRODUCT_STATUSES.includes(value as ProductStatus)
    ? (value as ProductStatus)
    : "ON_SALE";
}

function toIsoDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const directDate = trimmed.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (directDate) {
    return directDate;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed.slice(0, 10);
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(parsed);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return trimmed.slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}

function calculateDDay(expiryDate: string) {
  if (!expiryDate) return 0;
  const target = new Date(`${expiryDate}T23:59:59+09:00`).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.ceil((target - Date.now()) / 86400000));
}

function normalizeSellerPreview(value: unknown): SellerPreview | null {
  const record = readRecord(value);
  if (!record) return null;

  const id = readString(record, ["id", "sellerProfileId", "sellerId"]);
  const shopName = readString(record, ["shopName", "name", "sellerName"], "판매자");

  if (!id && !shopName) return null;

  return {
    id: id || "seller",
    shopName,
  };
}

function normalizePriceHistory(value: unknown) {
  return readArray(value)
    .map((entry) => {
      const record = readRecord(entry);
      if (!record) return null;

      return {
        dDay: readNumber(record, ["dDay", "day", "daysBeforeExpiry"], 0),
        price: readNumber(record, ["price", "currentPrice", "amount"], 0),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
}

function normalizeProduct(raw: unknown): ProductDetail {
  const record = readRecord(raw) ?? {};
  const originalPrice = readNumber(record, ["originalPrice", "price", "basePrice"], 0);
  const currentPrice = readNumber(
    record,
    ["currentPrice", "salePrice", "discountedPrice", "price"],
    originalPrice,
  );
  const expiryDate = toIsoDate(
    readString(record, ["expiryDate", "expiresAt", "expiredAt", "deadline"], ""),
  );
  const dDay = readNumber(record, ["dDay", "dday"], calculateDDay(expiryDate));
  const discountRate =
    readNumber(record, ["discountRate", "discountPercent"], 0) ||
    (originalPrice > 0
      ? Math.max(0, Math.round(((originalPrice - currentPrice) / originalPrice) * 100))
      : 0);

  return {
    id: readString(record, ["id", "productId"], ""),
    name: readString(record, ["name", "title"], "이름 없는 상품"),
    category: normalizeCategory(readString(record, ["category", "productCategory"], "OTHER")),
    originalPrice,
    currentPrice,
    discountRate,
    stock: readNumber(
      record,
      [
        "stock",
        "inventory",
        "quantity",
        "availableStock",
        "availableQuantity",
        "remainingStock",
        "remainingQuantity",
      ],
      0,
    ),
    expiryDate,
    status: normalizeStatus(readString(record, ["status", "productStatus"], "ON_SALE")),
    dDay,
    imageUrl: readNullableString(record, ["imageUrl", "thumbnailUrl", "image"]),
    description: readNullableString(record, ["description", "content", "body"]),
    seller: normalizeSellerPreview(
      record.seller ?? record.shop ?? record.owner ?? record.sellerProfile,
    ),
    priceHistory: normalizePriceHistory(
      record.priceHistory ?? record.priceHistories ?? record.history,
    ),
  };
}

function normalizeProductListData(
  raw: unknown,
  fallbackPage: number,
  fallbackLimit: number,
): ProductListData {
  const record = readRecord(raw) ?? {};
  const products = readArray(record.products ?? record.items ?? record.content).map(normalizeProduct);
  const paginationRecord =
    readRecord(record.pagination) ??
    readRecord(record.pageInfo) ??
    readRecord(record.meta) ??
    record;
  const page = readNumber(paginationRecord, ["page", "currentPage", "number"], fallbackPage);
  const limit = readNumber(paginationRecord, ["limit", "size", "pageSize"], fallbackLimit);
  const total = readNumber(paginationRecord, ["total", "totalCount", "count"], products.length);
  const totalPages = readNumber(
    paginationRecord,
    ["totalPages", "pageCount"],
    Math.max(1, Math.ceil(total / Math.max(limit, 1))),
  );

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

async function getProductsPage({
  page = 1,
  limit = 20,
  category,
  sort = "expiry_asc",
  status,
  q,
}: ProductQueryOptions) {
  const response = await backendApi.get("/api/products", {
    params: {
      page,
      limit,
      category,
      sort,
      status,
      q,
    },
  });

  const data = unwrapApiResponse<unknown>(response, "상품 목록을 불러오지 못했습니다.");
  return normalizeProductListData(data, page, limit);
}

export const getProducts = cache(
  async (options: ProductQueryOptions) => getProductsPage(options),
);

export const getProductDetail = cache(async (id: string) => {
  const response = await backendApi.get(`/api/products/${id}`);
  const data = unwrapApiResponse<unknown>(response, "상품 정보를 불러오지 못했습니다.");
  return normalizeProductDetailData(data);
});

export function normalizeProductDetailData(raw: unknown) {
  const record = readRecord(raw);
  const productSource = record?.product ?? record?.item ?? raw;

  return {
    product: normalizeProduct(productSource),
  };
}

export async function getProductFeedPage({
  q = "",
  ...options
}: ProductQueryOptions & { q?: string }): Promise<ProductFeedPage> {
  const data = await getProductsPage({
    ...options,
    q,
  });
  return normalizeProductFeedPage(data, q);
}
