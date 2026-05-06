import { NextRequest } from "next/server";

import { proxyJson } from "@/lib/shared/api/server";

export async function GET() {
  return proxyJson({
    path: "/api/cart",
    method: "GET",
    auth: true,
    fallbackMessage: "장바구니를 불러오지 못했습니다.",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyJson({
    path: "/api/cart",
    method: "POST",
    body,
    auth: true,
    fallbackMessage: "장바구니에 담지 못했습니다.",
    allowEmptySuccess: true,
    emptyData: {},
  });
}

export async function DELETE() {
  return proxyJson({
    path: "/api/cart",
    method: "DELETE",
    auth: true,
    fallbackMessage: "장바구니를 비우지 못했습니다.",
    allowEmptySuccess: true,
    emptyData: {},
  });
}
