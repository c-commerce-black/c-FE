import { proxyJson } from "@/lib/shared/api/server";

type Params = Promise<{ id: string }>;

export async function GET(
  _request: Request,
  { params }: { params: Params },
) {
  const { id } = await params;
  return proxyJson({
    path: `/api/products/${id}`,
    method: "GET",
    fallbackMessage: "상품 정보를 불러오지 못했습니다.",
  });
}
