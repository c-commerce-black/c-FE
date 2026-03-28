import { proxyJson } from "@/lib/bff";

type Params = Promise<{ id: string }>;

export async function PATCH(
  _request: Request,
  { params }: { params: Params },
) {
  const { id } = await params;
  return proxyJson({
    path: `/api/orders/${id}/cancel`,
    method: "PATCH",
    auth: true,
  });
}
