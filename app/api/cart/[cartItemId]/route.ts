import { NextRequest } from "next/server";

import { proxyJson } from "@/lib/bff";

type Params = Promise<{ cartItemId: string }>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params },
) {
  const body = await request.json();
  const { cartItemId } = await params;
  return proxyJson({
    path: `/api/cart/${cartItemId}`,
    method: "PATCH",
    body,
    auth: true,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params },
) {
  const { cartItemId } = await params;
  return proxyJson({
    path: `/api/cart/${cartItemId}`,
    method: "DELETE",
    auth: true,
  });
}
