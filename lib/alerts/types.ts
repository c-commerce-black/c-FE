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
  isRead: boolean | null;
  isTriggered: boolean;
  notifiedAt: string | null;
  product: AlertProduct;
};

export type AlertsData = {
  wishAlerts: AlertItem[];
  todayDeals: AlertItem[];
  unreadCount: number;
};
