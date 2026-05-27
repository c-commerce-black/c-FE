import { proxyJson } from "@/lib/shared/api/server";

type Params = Promise<{ id: string }>;

export async function POST(
  _request: Request,
  { params }: { params: Params },
) {
  const { id } = await params;
  return proxyJson({
    path: `/api/orders/${id}/pay`,
    method: "POST",
    auth: true,
    fallbackMessage: "주문 결제에 실패했습니다.",
  });
}
