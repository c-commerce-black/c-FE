import { fetchBackend } from "@/lib/shared/api";

import type { AlertItem } from "./types";

export async function getAlerts(token: string) {
  return fetchBackend<{ wishAlerts: AlertItem[]; todayDeals: AlertItem[] }>(
    "/api/alerts",
    { token },
  );
}
