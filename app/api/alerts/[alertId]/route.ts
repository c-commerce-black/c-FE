import { proxyJson } from "@/lib/bff";

type Params = Promise<{ alertId: string }>;

export async function DELETE(
  _request: Request,
  { params }: { params: Params },
) {
  const { alertId } = await params;
  return proxyJson({
    path: `/api/alerts/${alertId}`,
    method: "DELETE",
    auth: true,
  });
}
