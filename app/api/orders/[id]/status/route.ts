import { NextRequest } from "next/server";

import { proxyJson } from "@/lib/bff";

type Params = Promise<{ id: string }>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params },
) {
  const { id } = await params;
  const body = await request.json();

  return proxyJson({
    path: `/api/orders/${id}/status`,
    method: "PATCH",
    body,
    auth: true,
    fallbackMessage: "주문 상태 변경에 실패했습니다.",
  });
}
