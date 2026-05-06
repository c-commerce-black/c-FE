import type { AxiosResponse } from "axios";

import { resolveApiResponseFromAxios } from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";
import { jsonApiResponse, jsonError } from "@/lib/shared/api/server";
import { normalizeProductDetailData } from "@/lib/catalog/service";
import type { ApiResponse } from "@/lib/shared/types";

type Params = Promise<{ id: string }>;

export async function GET(
  _request: Request,
  { params }: { params: Params },
) {
  const { id } = await params;
  let response: AxiosResponse<unknown>;
  try {
    response = await backendApi.get(`/api/products/${id}`, {
      validateStatus: () => true,
    });
  } catch {
    return jsonError("상품 정보를 불러오지 못했습니다.", 503);
  }

  const { payload } = resolveApiResponseFromAxios<unknown>(
    response,
    "상품 정보를 불러오지 못했습니다.",
  );

  if (!payload.success) {
    return jsonApiResponse({
      status: response.status,
      payload,
      fallbackMessage: "상품 정보를 불러오지 못했습니다.",
    });
  }

  const data = normalizeProductDetailData(payload.data);

  return jsonApiResponse(
    {
      status: response.status,
      payload: {
        success: true,
        data,
      } satisfies ApiResponse<typeof data>,
      fallbackMessage: "상품 정보를 불러오지 못했습니다.",
    },
  );
}
