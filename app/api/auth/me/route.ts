import { proxyJson } from "@/lib/bff";

export async function GET() {
  return proxyJson({
    path: "/api/auth/me",
    method: "GET",
    auth: true,
    fallbackMessage: "사용자 정보를 불러오지 못했습니다.",
  });
}
