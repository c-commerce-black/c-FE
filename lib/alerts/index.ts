import { fetchBackend } from "@/lib/shared/api";
import type { ProductStatus } from "@/lib/catalog";

export type AlertProduct = {
  id: string;
  name: string;
  currentPrice: number;
  status: ProductStatus;
  remainSeconds: number;
};

export type AlertItem = {
  alertId: string | null;
  isOn: boolean;
  product: AlertProduct;
};

export async function getAlerts(token: string) {
  return fetchBackend<{ wishAlerts: AlertItem[]; todayDeals: AlertItem[] }>(
    "/api/alerts",
    { token },
  );
}
