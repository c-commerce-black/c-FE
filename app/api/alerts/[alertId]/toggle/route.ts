import { proxyJson } from "@/lib/shared/api/server";

type Params = Promise<{ alertId: string }>;

export async function PATCH(
  _request: Request,
  { params }: { params: Params },
) {
  const { alertId } = await params;
  return proxyJson({
    path: `/api/alerts/${alertId}/toggle`,
    method: "PATCH",
    auth: true,
    fallbackMessage: "알림 토글에 실패했습니다.",
  });
}
