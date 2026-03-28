import { proxyJson } from "@/lib/bff";

type Params = Promise<{ id: string }>;

export async function GET(
  _request: Request,
  { params }: { params: Params },
) {
  const { id } = await params;
  return proxyJson({
    path: `/api/orders/${id}`,
    method: "GET",
    auth: true,
    fallbackMessage: "주문 정보를 불러오지 못했습니다.",
  });
}
