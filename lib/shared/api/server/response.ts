import { NextResponse } from "next/server";

import { backendApi } from "@/lib/shared/api/backend";
import { resolveApiResponseFromAxios } from "@/lib/shared/api";
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
  const response = await backendApi.request({
    url: path,
    method,
    data: body,
    params: query,
    token,
    validateStatus: () => true,
  });
  const { payload } = resolveApiResponseFromAxios(response, fallbackMessage ?? "응답을 처리할 수 없습니다.");

  return jsonApiResponse({
    status: response.status,
    payload,
    fallbackMessage: "응답을 처리할 수 없습니다.",
  });
}

export async function proxyMultipart({
  path,
  formData,
  auth = false,
  fallbackMessage,
}: {
  path: string;
  formData: FormData;
  auth?: boolean;
  fallbackMessage?: string;
}) {
  const token = auth ? await getSessionTokenFromCookies() : null;
  const response = await backendApi.request({
    url: path,
    method: "POST",
    data: formData,
    token,
    validateStatus: () => true,
  });
  const { payload } = resolveApiResponseFromAxios(
    response,
    fallbackMessage ?? "응답을 처리할 수 없습니다.",
  );

  return jsonApiResponse({
    status: response.status,
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
