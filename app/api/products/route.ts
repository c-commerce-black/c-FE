import { NextRequest, NextResponse } from "next/server";

import { getProducts } from "@/lib/catalog";
import type { ProductListData, ProductStatus } from "@/lib/catalog";
import type { ApiResponse } from "@/lib/shared/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "8");
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "expiry_asc";
  const status = (searchParams.get("status") ?? "") as ProductStatus | "";

  const data = await getProducts({
    page: Number.isNaN(page) ? 1 : page,
    limit: Number.isNaN(limit) ? 8 : limit,
    category,
    sort,
    status,
  });

  return NextResponse.json(
    {
      success: true,
      data,
    } satisfies ApiResponse<ProductListData>,
  );
}
