import type { ProductStatus } from "@/lib/catalog";
import type { Pagination } from "@/lib/shared/types";

export type SellerProduct = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  originalPrice?: number;
  currentPrice: number;
  stock: number;
  expiryDate: string;
  imageUrl?: string | null;
  status: ProductStatus;
  todaySoldCount: number;
};

export type SellerProductsData = {
  todaySales: number;
  stats: {
    onSale: number;
    expirySoon: number;
    todayOrders: number;
  };
  products: SellerProduct[];
  pagination: Pagination;
};

export type SellerProductsQuery = {
  page?: number;
  limit?: number;
};
