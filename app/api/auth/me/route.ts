import { proxyJson } from "@/lib/bff";

export async function GET() {
  return proxyJson({
    path: "/api/auth/me",
    method: "GET",
    auth: true,
  });
}
