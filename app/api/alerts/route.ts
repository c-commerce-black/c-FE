import { NextRequest } from "next/server";

import { proxyJson } from "@/lib/shared/api/server";

export async function GET() {
  return proxyJson({
    path: "/api/alerts",
    method: "GET",
    auth: true,
    fallbackMessage: "알림 목록을 불러오지 못했습니다.",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyJson({
    path: "/api/alerts",
    method: "POST",
    body,
    auth: true,
    fallbackMessage: "찜 처리에 실패했습니다.",
  });
}
