import { requestBackend } from "@/lib/shared/api";
import { env } from "@/lib/shared/env";
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
    const { status, payload } = await requestBackend("/api/auth/logout", {
      method: "POST",
      token,
      fallbackMessage: "로그아웃에 실패했습니다.",
      emptyResponsePayload,
    });
    const responseStatus =
      status === 204 && payload && "success" in payload && payload.success ? 200 : status;
    const response = jsonApiResponse({
      status: responseStatus,
      payload,
      fallbackMessage: "로그아웃에 실패했습니다.",
    });
    response.cookies.delete(env.sessionCookieName);
    return response;
  } catch {
    return jsonError("로그아웃 요청을 처리할 수 없습니다.");
  }
}
