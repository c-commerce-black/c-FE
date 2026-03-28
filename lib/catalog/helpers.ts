import type {
  ExploreFilters,
  Product,
  ProductFeedPage,
  ProductListData,
  ProductStatus,
} from "./types";

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
