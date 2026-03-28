import { NextRequest } from "next/server";

import { proxyJson } from "@/lib/bff";

export async function GET() {
  return proxyJson({
    path: "/api/alerts",
    method: "GET",
    auth: true,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyJson({
    path: "/api/alerts",
    method: "POST",
    body,
    auth: true,
  });
}
