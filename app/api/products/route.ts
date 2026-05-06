import { NextRequest, NextResponse } from "next/server";

import type { ProductListData, ProductStatus } from "@/lib/catalog";
import { getProducts } from "@/lib/catalog/service";
import type { ApiResponse } from "@/lib/shared/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "expiry_asc";
  const status = (searchParams.get("status") ?? "") as ProductStatus | "";
  const q = searchParams.get("q") ?? "";

  const data = await getProducts({
    page: Number.isNaN(page) ? 1 : page,
    limit: Number.isNaN(limit) ? 20 : limit,
    category,
    sort,
    status,
    q,
  });

  return NextResponse.json(
    {
      success: true,
      data,
    } satisfies ApiResponse<ProductListData>,
  );
}
