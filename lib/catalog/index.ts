import { cache } from "react";

import { fetchBackend } from "@/lib/shared/api";
import type { Pagination } from "@/lib/shared/types";

export type ProductCategory =
  | "FOOD"
  | "BEAUTY"
  | "DRINK"
  | "MEAL_KIT"
  | "OTHER";

export type ProductStatus =
  | "ON_SALE"
  | "EXPIRY_SOON"
  | "SOLD_OUT"
  | "EXPIRED"
  | "DELETED";

export type SellerPreview = {
  id: string;
  shopName: string;
};

export type PricePoint = {
  dDay: number;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  originalPrice: number;
  currentPrice: number;
  discountRate: number;
  stock: number;
  expiryDate: string;
  status: ProductStatus;
  dDay: number;
  imageUrl?: string | null;
};

export type ProductDetail = Product & {
  description?: string | null;
  seller?: SellerPreview | null;
  priceHistory?: PricePoint[];
};

export type ProductListData = {
  products: Product[];
  pagination: Pagination;
};

export type ExploreFilters = {
  category: string;
  sort: string;
  q: string;
};

export type ProductFeedPage = {
  items: Product[];
  nextPage: number | null;
  hasMore: boolean;
  total: number;
};

export type ExploreFeedState = {
  filters: ExploreFilters;
  items: Product[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  scrollY: number;
  total: number;
  initialized: boolean;
};

export const CATEGORY_LABELS = {
  FOOD: "식품",
  BEAUTY: "뷰티",
  DRINK: "음료",
  MEAL_KIT: "간편식",
  OTHER: "기타",
} as const;

export const STATUS_LABELS = {
  ON_SALE: "판매중",
  EXPIRY_SOON: "임박특가",
  SOLD_OUT: "품절",
  EXPIRED: "만료",
  DELETED: "삭제",
} as const;

export const SORT_OPTIONS = [
  { value: "expiry_asc", label: "마감임박순" },
  { value: "discount_desc", label: "할인율순" },
  { value: "price_asc", label: "가격낮은순" },
  { value: "price_desc", label: "가격높은순" },
] as const;

export const EXPLORE_PAGE_SIZE = 3;

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-banana",
    name: "유기농 바나나 1송이",
    category: "FOOD",
    originalPrice: 12900,
    currentPrice: 8900,
    discountRate: 31,
    stock: 24,
    expiryDate: "2026-03-29",
    status: "EXPIRY_SOON",
    dDay: 1,
    imageUrl: null,
  },
  {
    id: "mock-salad",
    name: "당일수확 샐러드 채소",
    category: "FOOD",
    originalPrice: 9800,
    currentPrice: 6400,
    discountRate: 35,
    stock: 42,
    expiryDate: "2026-03-30",
    status: "EXPIRY_SOON",
    dDay: 2,
    imageUrl: null,
  },
  {
    id: "mock-egg",
    name: "무항생제 계란 15구",
    category: "FOOD",
    originalPrice: 7500,
    currentPrice: 4900,
    discountRate: 34,
    stock: 31,
    expiryDate: "2026-03-29",
    status: "EXPIRY_SOON",
    dDay: 1,
    imageUrl: null,
  },
  {
    id: "mock-salmon",
    name: "생연어 스테이크 300g",
    category: "MEAL_KIT",
    originalPrice: 18900,
    currentPrice: 12900,
    discountRate: 32,
    stock: 12,
    expiryDate: "2026-04-01",
    status: "ON_SALE",
    dDay: 3,
    imageUrl: null,
  },
];

export const MOCK_PRODUCT_DETAILS: Record<string, ProductDetail> = {
  "mock-banana": {
    ...MOCK_PRODUCTS[0],
    description: "친환경 농법으로 재배한 바나나를 임박특가로 준비했습니다.",
    seller: {
      id: "seller-mock",
      shopName: "신선한 하루",
    },
    priceHistory: [
      { dDay: 7, price: 11900 },
      { dDay: 5, price: 10900 },
      { dDay: 3, price: 9900 },
      { dDay: 1, price: 8900 },
    ],
  },
  "mock-salad": {
    ...MOCK_PRODUCTS[1],
    description: "오늘 수확한 샐러드 채소를 바로 배송합니다.",
    seller: {
      id: "seller-mock",
      shopName: "당일농장",
    },
    priceHistory: [
      { dDay: 7, price: 8900 },
      { dDay: 5, price: 7900 },
      { dDay: 3, price: 6900 },
      { dDay: 2, price: 6400 },
    ],
  },
  "mock-egg": {
    ...MOCK_PRODUCTS[2],
    description: "무항생제 인증 계란을 한정 수량으로 제공합니다.",
    seller: {
      id: "seller-mock",
      shopName: "계란연구소",
    },
    priceHistory: [
      { dDay: 6, price: 6900 },
      { dDay: 4, price: 5900 },
      { dDay: 2, price: 5200 },
      { dDay: 1, price: 4900 },
    ],
  },
  "mock-salmon": {
    ...MOCK_PRODUCTS[3],
    description: "고단백 연어 스테이크를 손질해 바로 조리할 수 있습니다.",
    seller: {
      id: "seller-mock",
      shopName: "씨푸드 마켓",
    },
    priceHistory: [
      { dDay: 10, price: 17900 },
      { dDay: 7, price: 15900 },
      { dDay: 4, price: 13900 },
      { dDay: 3, price: 12900 },
    ],
  },
};

type ProductQueryOptions = {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
  status?: ProductStatus | "";
};

function getMockProductsData({
  page = 1,
  limit = 8,
  category,
  sort = "expiry_asc",
}: {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
}) {
  const byCategory = category
    ? MOCK_PRODUCTS.filter((product) => product.category === category)
    : MOCK_PRODUCTS;
  const sorted = [...byCategory].sort((left, right) => {
    if (sort === "discount_desc") return right.discountRate - left.discountRate;
    if (sort === "price_asc") return left.currentPrice - right.currentPrice;
    if (sort === "price_desc") return right.currentPrice - left.currentPrice;
    return left.dDay - right.dDay;
  });
  const start = (page - 1) * limit;
  const sliced = sorted.slice(start, start + limit);

  return {
    products: sliced,
    pagination: {
      page,
      limit,
      total: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / limit)),
    },
  };
}

async function getProductsPage({
  page = 1,
  limit = 8,
  category,
  sort = "expiry_asc",
  status,
}: ProductQueryOptions) {
  try {
    return await fetchBackend<ProductListData>("/api/products", {
      query: {
        page,
        limit,
        category,
        sort,
        status,
      },
    });
  } catch {
    return getMockProductsData({
      page,
      limit,
      category,
      sort,
    });
  }
}

export const getProducts = cache(
  async (options: ProductQueryOptions) => getProductsPage(options),
);

export const getProductDetail = cache(async (id: string) => {
  try {
    return await fetchBackend<{ product: ProductDetail }>(`/api/products/${id}`);
  } catch {
    const fallback = MOCK_PRODUCT_DETAILS[id];
    if (!fallback) throw new Error("product-not-found");
    return { product: fallback };
  }
});

export function filterProducts(products: Product[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return products;
  return products.filter((product) =>
    product.name.toLowerCase().includes(normalized),
  );
}

export function createExploreFilters(
  filters: Partial<ExploreFilters> = {},
): ExploreFilters {
  return {
    category: filters.category ?? "",
    sort: filters.sort ?? "expiry_asc",
    q: filters.q ?? "",
  };
}

export async function getProductFeedPage({
  q = "",
  ...options
}: ProductQueryOptions & { q?: string }): Promise<ProductFeedPage> {
  const data = await getProductsPage(options);
  return normalizeProductFeedPage(data, q);
}

export function normalizeProductFeedPage(
  data: ProductListData,
  q = "",
): ProductFeedPage {
  const items = filterProducts(data.products, q);
  const hasMore = data.pagination.page < data.pagination.totalPages;

  return {
    items,
    nextPage: hasMore ? data.pagination.page + 1 : null,
    hasMore,
    total: data.pagination.total,
  };
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
