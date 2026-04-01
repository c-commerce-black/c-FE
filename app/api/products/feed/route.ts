import { NextRequest, NextResponse } from "next/server";

import type { ProductFeedPage } from "@/lib/catalog";
import { getProductFeedPage } from "@/lib/catalog/service";
import type { ApiResponse } from "@/lib/shared/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "8");
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "expiry_asc";
  const q = searchParams.get("q") ?? "";

  const data = await getProductFeedPage({
    page: Number.isNaN(page) ? 1 : page,
    limit: Number.isNaN(limit) ? 8 : limit,
    category,
    sort,
    q,
  });

  return NextResponse.json(
    {
      success: true,
      data,
    } satisfies ApiResponse<ProductFeedPage>,
  );
}
