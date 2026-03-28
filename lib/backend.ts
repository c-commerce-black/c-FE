import { env } from "@/lib/env";
import type { ApiResponse } from "@/lib/types";

type Primitive = string | number | boolean;

type RequestBackendOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  query?: Record<string, Primitive | null | undefined>;
  body?: BodyInit | object | null;
};

export class BackendError extends Error {
  statusCode: number;
  payload?: unknown;

  constructor(message: string, statusCode: number, payload?: unknown) {
    super(message);
    this.name = "BackendError";
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

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

async function parsePayload(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiResponse<unknown>;
  } catch {
    return {
      success: false,
      error: {
        message: text || "알 수 없는 응답입니다.",
        statusCode: response.status,
      },
    } satisfies ApiResponse<never>;
  }
}

export async function requestBackend(
  path: string,
  { token, query, headers, body, ...init }: RequestBackendOptions = {},
) {
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let finalBody = body as BodyInit | undefined;
  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    requestHeaders.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  }

  const response = await fetch(toUrl(path, query), {
    ...init,
    headers: requestHeaders,
    body: finalBody,
    cache: init.cache ?? "no-store",
  });

  const payload = await parsePayload(response);
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
