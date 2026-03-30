import { env } from "@/lib/shared/env";
import type { ApiResponse } from "@/lib/shared/types";

import { BackendError } from "./errors";
import { readApiResponseWithMeta } from "./response";

type Primitive = string | number | boolean;

type RequestBackendOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  query?: Record<string, Primitive | null | undefined>;
  body?: BodyInit | object | null;
  fallbackMessage?: string;
  emptyResponsePayload?: ApiResponse<unknown>;
  suppressUnexpectedResponseLog?: boolean;
};

function toUrl(path: string, query?: RequestBackendOptions["query"]) {
  const url = new URL(path, env.apiBaseUrl);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url;
}

export async function requestBackend(
  path: string,
  {
    token,
    query,
    headers,
    body,
    fallbackMessage,
    emptyResponsePayload,
    suppressUnexpectedResponseLog,
    ...init
  }: RequestBackendOptions = {},
) {
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let finalBody = body as BodyInit | undefined;
  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams)
  ) {
    requestHeaders.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  }

  const response = await fetch(toUrl(path, query), {
    ...init,
    headers: requestHeaders,
    body: finalBody,
    cache: init.cache ?? "no-store",
  });

  const { payload: parsedPayload, unexpected, reason } = await readApiResponseWithMeta(
    response,
    fallbackMessage ?? "요청을 처리하지 못했습니다.",
  );
  const hasHandledEmptySuccessResponse =
    response.ok &&
    !!emptyResponsePayload &&
    (reason === "empty-body" || reason === "empty-object");
  const payload = hasHandledEmptySuccessResponse
    ? emptyResponsePayload
    : parsedPayload;

  if (unexpected && !suppressUnexpectedResponseLog && !hasHandledEmptySuccessResponse) {
    console.error("Unexpected backend response", {
      path,
      status: response.status,
      contentType: response.headers.get("content-type"),
      reason,
    });
  }

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
}

export async function fetchBackend<T>(
  path: string,
  options?: RequestBackendOptions,
): Promise<T> {
  const { ok, status, payload } = await requestBackend(path, options);

  if (!ok || !payload || !("success" in payload) || !payload.success) {
    const message =
      payload && "success" in payload && !payload.success
        ? payload.error.message
        : "요청을 처리하지 못했습니다.";
    throw new BackendError(message, status, payload);
  }

  return payload.data as T;
}
