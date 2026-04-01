import { NextRequest } from "next/server";

import { resolveApiResponseFromAxios } from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";
import { createSessionAuthResponse } from "@/lib/auth/server";
import { jsonError } from "@/lib/shared/api/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await backendApi.post("/api/auth/register", body, {
      validateStatus: () => true,
    });
    const { payload } = resolveApiResponseFromAxios(response, "회원가입에 실패했습니다.");

    return createSessionAuthResponse({
      status: response.status,
      payload,
      fallbackMessage: "회원가입에 실패했습니다.",
    });
  } catch {
    return jsonError("회원가입 요청을 처리할 수 없습니다.");
  }
}
