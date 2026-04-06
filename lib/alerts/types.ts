import type { ProductStatus } from "@/lib/catalog";

export type AlertProduct = {
  id: string;
  name: string;
  currentPrice: number;
  status: ProductStatus;
  remainSeconds: number;
  imageUrl?: string | null;
};

export type AlertItem = {
  alertId: string | null;
  isOn: boolean;
  product: AlertProduct;
};
