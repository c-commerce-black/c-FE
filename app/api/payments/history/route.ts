import { proxyJson } from "@/lib/shared/api/server";

export async function GET() {
  return proxyJson({
    path: "/api/payments/history",
    method: "GET",
    auth: true,
    fallbackMessage: "결제 기록을 불러오지 못했습니다.",
  });
}
