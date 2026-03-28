import { proxyJson } from "@/lib/bff";

export async function GET() {
  return proxyJson({
    path: "/health",
    method: "GET",
  });
}
