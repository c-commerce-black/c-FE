import type { ApiResponse } from "@/lib/shared/types";
import { env } from "@/lib/shared/env";

const MAX_VISIBLE_MESSAGE_LENGTH = 140;

const SUSPICIOUS_MESSAGE_PATTERNS = [
  /<!doctype/i,
  /<(html|body|head|meta|script|style|link)\b/i,
  /<\/[a-z]/i,
  /\b(?:SyntaxError|TypeError|ReferenceError|RangeError|URIError|EvalError|AggregateError|Exception)\b/i,
  /\b(?:SQL|SQLite|PostgreSQL|Prisma|Sequelize|Mongo|Redis)\b/i,
  /\b(?:Traceback|stack trace|Unhandled|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN)\b/i,
  /\bat\s+.+:\d+:\d+/,
  /https?:\/\/\S+/i,
  /files\.cloudtype\.io/i,
  /(?:^|[\s(])(?:[A-Za-z]:\\|\/[\w.-][\w./-]*\.[A-Za-z0-9]+)(?::\d+)?/,
] as const;

type Primitive = string | number | boolean;

type RequestBackendOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  query?: Record<string, Primitive | null | undefined>;
  body?: BodyInit | object | null;
  fallbackMessage?: string;
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

function createFallbackResponse<T>(
  statusCode: number,
  fallbackMessage: string,
): ApiResponse<T> {
  return {
    success: false,
    error: {
      message: fallbackMessage,
      statusCode,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiResponseShape<T>(value: unknown): value is ApiResponse<T> {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return false;
  }

  if (value.success) {
    return "data" in value;
  }

  return isRecord(value.error);
}

function normalizeApiResponse<T>(
  value: unknown,
  statusCode: number,
  fallbackMessage: string,
): { payload: ApiResponse<T>; unexpected: boolean } {
  if (isApiResponseShape<T>(value)) {
    if (value.success) {
      return { payload: value, unexpected: false };
    }

    return {
      payload: {
        success: false,
        error: {
          message: sanitizeUserMessage(value.error.message, fallbackMessage),
          statusCode:
            typeof value.error.statusCode === "number"
              ? value.error.statusCode
              : statusCode,
        },
      },
      unexpected:
        sanitizeUserMessage(value.error.message, fallbackMessage) === fallbackMessage &&
        value.error.message !== fallbackMessage,
    };
  }

  if (isRecord(value) && typeof value.message === "string") {
    return {
      payload: createFallbackResponse<T>(
        statusCode,
        sanitizeUserMessage(value.message, fallbackMessage),
      ),
      unexpected: true,
    };
  }

  return {
    payload: createFallbackResponse<T>(statusCode, fallbackMessage),
    unexpected: true,
  };
}

function parseApiResponseText<T>(
  rawText: string,
  statusCode: number,
  contentType: string | null,
  fallbackMessage: string,
) {
  const text = rawText.trim();
  if (!text) {
    return {
      payload: createFallbackResponse<T>(statusCode, fallbackMessage),
      unexpected: true,
    };
  }

  const normalizedContentType = contentType?.toLowerCase() ?? "";
  const expectsJson =
    normalizedContentType.includes("json") ||
    text.startsWith("{") ||
    text.startsWith("[");

  if (!expectsJson) {
    return {
      payload: createFallbackResponse<T>(statusCode, fallbackMessage),
      unexpected: true,
    };
  }

  try {
    return normalizeApiResponse<T>(JSON.parse(text), statusCode, fallbackMessage);
  } catch {
    return {
      payload: createFallbackResponse<T>(statusCode, fallbackMessage),
      unexpected: true,
    };
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

export function sanitizeUserMessage(
  message: string | null | undefined,
  fallbackMessage: string,
) {
  if (typeof message !== "string") {
    return fallbackMessage;
  }

  const trimmed = message.trim();
  if (!trimmed) {
    return fallbackMessage;
  }

  if (trimmed.length > MAX_VISIBLE_MESSAGE_LENGTH) {
    return fallbackMessage;
  }

  if (/[\r\n]/.test(trimmed)) {
    return fallbackMessage;
  }

  if (SUSPICIOUS_MESSAGE_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return fallbackMessage;
  }

  return trimmed.replace(/\s+/g, " ");
}

export async function readApiResponseWithMeta<T>(
  response: Response,
  fallbackMessage: string,
) {
  const rawText = await response.text();
  return parseApiResponseText<T>(
    rawText,
    response.status,
    response.headers.get("content-type"),
    fallbackMessage,
  );
}

export async function readApiResponse<T>(
  response: Response,
  fallbackMessage: string,
) {
  const { payload } = await readApiResponseWithMeta<T>(response, fallbackMessage);
  return payload;
}

export async function requestApi<T>(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  fallbackMessage: string,
) {
  const response = await fetch(input, init);
  const { payload } = await readApiResponseWithMeta<T>(response, fallbackMessage);

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
}

export function getApiErrorMessage<T>(
  payload: ApiResponse<T>,
  fallbackMessage: string,
) {
  return payload.success ? fallbackMessage : payload.error.message;
}

export async function requestBackend(
  path: string,
  { token, query, headers, body, fallbackMessage, ...init }: RequestBackendOptions = {},
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

  const { payload, unexpected } = await readApiResponseWithMeta(
    response,
    fallbackMessage ?? "요청을 처리하지 못했습니다.",
  );

  if (unexpected) {
    console.error("Unexpected backend response", {
      path,
      status: response.status,
      contentType: response.headers.get("content-type"),
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
