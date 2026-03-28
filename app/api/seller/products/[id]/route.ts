import { NextRequest } from "next/server";

import { proxyJson } from "@/lib/bff";

type Params = Promise<{ id: string }>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params },
) {
  const { id } = await params;
  const body = await request.json();
  return proxyJson({
    path: `/api/seller/products/${id}`,
    method: "PATCH",
    body,
    auth: true,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params },
) {
  const { id } = await params;
  return proxyJson({
    path: `/api/seller/products/${id}`,
    method: "DELETE",
    auth: true,
  });
}
