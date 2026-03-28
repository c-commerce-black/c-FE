import { proxyJson } from "@/lib/bff";

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
  });
}
