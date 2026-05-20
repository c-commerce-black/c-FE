import { unwrapApiResponse } from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";

import { normalizeAlertsData } from "./normalize";

export async function getAlerts(token: string) {
  const response = await backendApi.get("/api/alerts", {
    token,
  });
  const data = unwrapApiResponse<unknown>(response, "알림 목록을 불러오지 못했습니다.");
  return normalizeAlertsData(data);
}
