import { NextRequest } from "next/server";

import { proxyJson } from "@/lib/shared/api/server";

type Params = Promise<{ cartItemId: string }>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params },
) {
  const body = await request.json();
  const { cartItemId } = await params;
  return proxyJson({
    path: `/api/cart/${cartItemId}`,
    method: "PATCH",
    body,
    auth: true,
    fallbackMessage: "수량 변경에 실패했습니다.",
    allowEmptySuccess: true,
    emptyData: {},
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params },
) {
  const { cartItemId } = await params;
  return proxyJson({
    path: `/api/cart/${cartItemId}`,
    method: "DELETE",
    auth: true,
    fallbackMessage: "장바구니 상품 삭제에 실패했습니다.",
    allowEmptySuccess: true,
    emptyData: {},
  });
}
