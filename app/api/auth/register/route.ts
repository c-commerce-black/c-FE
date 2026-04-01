import { NextRequest } from "next/server";

import { requestBackend } from "@/lib/shared/api";
import { createSessionAuthResponse } from "@/lib/auth/server";
import { jsonError } from "@/lib/shared/api/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, payload } = await requestBackend("/api/auth/register", {
      method: "POST",
      body,
      fallbackMessage: "회원가입에 실패했습니다.",
    });

    return createSessionAuthResponse({
      status,
      payload,
      fallbackMessage: "회원가입에 실패했습니다.",
    });
  } catch {
    return jsonError("회원가입 요청을 처리할 수 없습니다.");
  }
}
