import { NextRequest } from "next/server";

import { proxyJson } from "@/lib/shared/api/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  return proxyJson({
    path: "/api/seller/products",
    method: "GET",
    auth: true,
    fallbackMessage: "판매 상품을 불러오지 못했습니다.",
    query: {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyJson({
    path: "/api/seller/products",
    method: "POST",
    body,
    auth: true,
    fallbackMessage: "상품 등록에 실패했습니다.",
    allowEmptySuccess: true,
    emptyData: {},
  });
}
