import {
  readArray,
  readNullableString,
  readNumber,
  readRecord,
  readString,
  unwrapApiResponse,
} from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";

import type { SellerProductsData, SellerProductsQuery } from "./types";
import type { ProductStatus, ProductCategory } from "@/lib/catalog";

const PRODUCT_STATUSES: ProductStatus[] = [
  "ON_SALE",
  "EXPIRY_SOON",
  "SOLD_OUT",
  "EXPIRED",
  "DELETED",
];

const PRODUCT_CATEGORIES: ProductCategory[] = [
  "FOOD",
  "BEAUTY",
  "DRINK",
  "MEAL_KIT",
  "OTHER",
];

function normalizeStatus(value: string): ProductStatus {
  return PRODUCT_STATUSES.includes(value as ProductStatus)
    ? (value as ProductStatus)
    : "ON_SALE";
}

function normalizeCategory(value: string): ProductCategory | null {
  return PRODUCT_CATEGORIES.includes(value as ProductCategory)
    ? (value as ProductCategory)
    : null;
}

function normalizeSellerProduct(raw: unknown) {
  const record = readRecord(raw) ?? {};
  return {
    id: readString(record, ["id", "productId"], ""),
    name: readString(record, ["name", "title"], "등록 상품"),
    description: readNullableString(record, ["description", "content"]),
    category: normalizeCategory(readString(record, ["category", "productCategory"], "")),
    originalPrice: readNumber(record, ["originalPrice", "price", "basePrice"], 0),
    currentPrice: readNumber(
      record,
      ["currentPrice", "salePrice", "discountedPrice", "price"],
      readNumber(record, ["originalPrice", "basePrice"], 0),
    ),
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
    expiryDate: readString(record, ["expiryDate", "expiresAt", "expiredAt", "deadline"], ""),
    imageUrl: readNullableString(record, ["imageUrl", "thumbnailUrl", "image"]),
    status: normalizeStatus(readString(record, ["status", "productStatus"], "ON_SALE")),
    todaySoldCount: readNumber(record, ["todaySoldCount", "soldTodayCount"], 0),
  };
}

function normalizeSellerProductsData(
  raw: unknown,
  query?: SellerProductsQuery,
): SellerProductsData {
  const record = readRecord(raw) ?? {};
  const products = readArray(record.products ?? record.items ?? record.content).map(
    normalizeSellerProduct,
  );
  const statsRecord = readRecord(record.stats) ?? readRecord(record.summary) ?? {};
  const paginationRecord =
    readRecord(record.pagination) ?? readRecord(record.pageInfo) ?? readRecord(record.meta) ?? {};

  return {
    todaySales: readNumber(record, ["todaySales", "salesToday"], 0),
    stats: {
      onSale: readNumber(statsRecord, ["onSale", "activeCount"], 0),
      expirySoon: readNumber(statsRecord, ["expirySoon", "expiringCount"], 0),
      todayOrders: readNumber(statsRecord, ["todayOrders", "ordersToday"], 0),
    },
    products,
    pagination: {
      page: readNumber(paginationRecord, ["page", "currentPage"], query?.page ?? 1),
      limit: readNumber(paginationRecord, ["limit", "size"], query?.limit ?? 20),
      total: readNumber(paginationRecord, ["total", "totalCount"], products.length),
      totalPages: readNumber(paginationRecord, ["totalPages", "pageCount"], 1),
    },
  };
}

export async function getSellerProducts(
  token: string,
  query?: SellerProductsQuery,
) {
  const response = await backendApi.get("/api/seller/products", {
    token,
    params: query,
  });
  const data = unwrapApiResponse<unknown>(response, "셀러 상품을 불러오지 못했습니다.");
  return normalizeSellerProductsData(data, query);
}

export async function getSellerProduct(token: string, id: string) {
  let page = 1;

  while (page <= 100) {
    const data = await getSellerProducts(token, {
      page,
      limit: 20,
    });
    const match = data.products.find((product) => product.id === id);
    if (match) {
      return match;
    }

    if (page >= data.pagination.totalPages) {
      break;
    }

    page += 1;
  }

  return null;
}
