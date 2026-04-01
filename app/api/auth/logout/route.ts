import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { backendApi, resolveApiResponseFromAxios } from "@/lib/shared/api";
import {
  getSessionTokenFromCookies,
  jsonApiResponse,
  jsonError,
} from "@/lib/shared/api/server";
import type { ApiResponse } from "@/lib/shared/types";

export async function POST() {
  try {
    const token = await getSessionTokenFromCookies();
    const emptyResponsePayload = {
      success: true,
      data: { message: "로그아웃 되었습니다." },
    } as const satisfies ApiResponse<unknown>;
    const response = await backendApi.post("/api/auth/logout", undefined, {
      token,
      validateStatus: () => true,
    });
    const { payload, reason } = resolveApiResponseFromAxios(
      response,
      "로그아웃에 실패했습니다.",
    );
    const normalizedPayload =
      response.status === 204 &&
      (reason === "empty-body" || reason === "empty-object")
        ? emptyResponsePayload
        : payload;
    const responseStatus =
      response.status === 204 &&
      normalizedPayload &&
      "success" in normalizedPayload &&
      normalizedPayload.success
        ? 200
        : response.status;
    const jsonResponse = jsonApiResponse({
      status: responseStatus,
      payload: normalizedPayload,
      fallbackMessage: "로그아웃에 실패했습니다.",
    });
    jsonResponse.cookies.delete(SESSION_COOKIE_NAME);
    return jsonResponse;
  } catch {
    return jsonError("로그아웃 요청을 처리할 수 없습니다.");
  }
}
