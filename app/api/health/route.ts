import { proxyJson } from "@/lib/shared/api/server";

export async function GET() {
  return proxyJson({
    path: "/health",
    method: "GET",
  });
}
