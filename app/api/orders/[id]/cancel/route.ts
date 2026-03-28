import { proxyJson } from "@/lib/shared/api/server";

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
    fallbackMessage: "주문 취소에 실패했습니다.",
  });
}
