import { NextResponse } from "next/server";

import { requestBackend } from "@/lib/shared/api";
import type { ApiResponse } from "@/lib/shared/types";

import { getSessionTokenFromCookies } from "./cookies";

export function resolveApiPayload<T>(
  payload: ApiResponse<T> | null | undefined,
  status: number,
  fallbackMessage: string,
): ApiResponse<T> {
  return (
    payload ?? {
      success: false,
      error: {
        message: fallbackMessage,
        statusCode: status,
      },
    }
  );
}

export function jsonApiResponse<T>({
  status,
  payload,
  fallbackMessage,
}: {
  status: number;
  payload?: ApiResponse<T> | null;
  fallbackMessage: string;
}) {
  return NextResponse.json(resolveApiPayload(payload, status, fallbackMessage), {
    status,
  });
}

export async function proxyJson({
  path,
  method,
  body,
  auth = false,
  query,
  fallbackMessage,
}: {
  path: string;
  method: string;
  body?: object | null;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
  fallbackMessage?: string;
}) {
  const token = auth ? await getSessionTokenFromCookies() : null;
  const { status, payload } = await requestBackend(path, {
    method,
    body,
    token,
    query,
    fallbackMessage,
  });

  return jsonApiResponse({
    status,
    payload,
    fallbackMessage: "응답을 처리할 수 없습니다.",
  });
}

export function jsonError(message: string, status = 500) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        statusCode: status,
      },
    } satisfies ApiResponse<never>,
    { status },
  );
}
