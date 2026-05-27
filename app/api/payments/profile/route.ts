import { proxyJson } from "@/lib/shared/api/server";

export async function GET() {
  return proxyJson({
    path: "/api/payments/profile",
    method: "GET",
    auth: true,
    fallbackMessage: "결제 지갑 정보를 불러오지 못했습니다.",
  });
}

export async function POST() {
  return proxyJson({
    path: "/api/payments/profile",
    method: "POST",
    auth: true,
    fallbackMessage: "결제 지갑 정보를 준비하지 못했습니다.",
  });
}
