import { NextRequest } from "next/server";

import { proxyJson } from "@/lib/bff";

export async function GET() {
  return proxyJson({
    path: "/api/cart",
    method: "GET",
    auth: true,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyJson({
    path: "/api/cart",
    method: "POST",
    body,
    auth: true,
  });
}

export async function DELETE() {
  return proxyJson({
    path: "/api/cart",
    method: "DELETE",
    auth: true,
  });
}
