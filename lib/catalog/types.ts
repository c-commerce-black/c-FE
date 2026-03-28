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
