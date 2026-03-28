import { NextRequest } from "next/server";

import { proxyJson } from "@/lib/bff";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  return proxyJson({
    path: "/api/orders",
    method: "GET",
    auth: true,
    fallbackMessage: "주문 목록을 불러오지 못했습니다.",
    query: {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyJson({
    path: "/api/orders",
    method: "POST",
    body,
    auth: true,
    fallbackMessage: "주문 생성에 실패했습니다.",
  });
}
