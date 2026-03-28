import { NextRequest, NextResponse } from "next/server";

import { requestBackend } from "@/lib/backend";
import { getSessionCookieOptions } from "@/lib/auth";
import { jsonError } from "@/lib/bff";
import type { ApiResponse, User } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, payload } = await requestBackend("/api/auth/login", {
      method: "POST",
      body,
      fallbackMessage: "로그인에 실패했습니다.",
    });

    const response = NextResponse.json((payload ?? {
      success: false,
      error: { message: "로그인에 실패했습니다.", statusCode: status },
    }) as ApiResponse<unknown>, { status });

    if (payload && "success" in payload && payload.success) {
      const data = payload.data as {
        user: User;
        accessToken: string;
        expiresIn: number;
      };
      response.cookies.set({
        ...getSessionCookieOptions(data.expiresIn),
        value: data.accessToken,
      });
    }

    return response;
  } catch {
    return jsonError("로그인 요청을 처리할 수 없습니다.");
  }
}
