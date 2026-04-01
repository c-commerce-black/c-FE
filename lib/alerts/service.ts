import { unwrapApiResponse } from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";

import type { AlertItem } from "./types";

export async function getAlerts(token: string) {
  const response = await backendApi.get("/api/alerts", {
    token,
  });
  return unwrapApiResponse<{ wishAlerts: AlertItem[]; todayDeals: AlertItem[] }>(
    response,
    "알림 목록을 불러오지 못했습니다.",
  );
}
