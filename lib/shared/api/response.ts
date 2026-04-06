import axios, { type AxiosError, type AxiosResponse } from "axios";

import type { ApiResponse } from "@/lib/shared/types";

const MAX_VISIBLE_MESSAGE_LENGTH = 140;

export type UnexpectedApiResponseReason =
  | "empty-body"
  | "empty-object"
  | "invalid-json"
  | "invalid-shape"
  | "non-json"
  | "plain-message";

type ApiResponseMeta<T> = {
  payload: ApiResponse<T>;
  unexpected: boolean;
  reason?: UnexpectedApiResponseReason;
};

type ResolveApiResponseOptions<T> = {
  allowEmptySuccess?: boolean;
  emptyData?: T;
};

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

function createEmptySuccessResponse<T>(emptyData?: T): ApiResponse<T> {
  return {
    success: true,
    data: (emptyData ?? ({} as T)) as T,
  };
}

function isSuccessfulStatus(statusCode: number) {
  return statusCode >= 200 && statusCode < 300;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isApiResponseShape<T>(value: unknown): value is ApiResponse<T> {
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
  options?: ResolveApiResponseOptions<T>,
): ApiResponseMeta<T> {
  if (isApiResponseShape<T>(value)) {
    if (value.success) {
      return { payload: value, unexpected: false };
    }

    const message = sanitizeUserMessage(value.error.message, fallbackMessage);
    return {
      payload: {
        success: false,
        error: {
          message,
          statusCode:
            typeof value.error.statusCode === "number"
              ? value.error.statusCode
              : statusCode,
        },
      },
      unexpected: message === fallbackMessage && value.error.message !== fallbackMessage,
    };
  }

  if (isRecord(value) && Object.keys(value).length === 0) {
    if (options?.allowEmptySuccess && isSuccessfulStatus(statusCode)) {
      return {
        payload: createEmptySuccessResponse(options.emptyData),
        unexpected: false,
      };
    }

    return {
      payload: createFallbackResponse<T>(statusCode, fallbackMessage),
      unexpected: true,
      reason: "empty-object",
    };
  }

  if (isRecord(value) && typeof value.message === "string") {
    return {
      payload: createFallbackResponse<T>(
        statusCode,
        sanitizeUserMessage(value.message, fallbackMessage),
      ),
      unexpected: true,
      reason: "plain-message",
    };
  }

  return {
    payload: createFallbackResponse<T>(statusCode, fallbackMessage),
    unexpected: true,
    reason: "invalid-shape",
  };
}

function parseApiResponseText<T>(
  rawText: string,
  statusCode: number,
  contentType: string | null | undefined,
  fallbackMessage: string,
  options?: ResolveApiResponseOptions<T>,
) {
  const text = rawText.trim();
  if (!text) {
    if (options?.allowEmptySuccess && isSuccessfulStatus(statusCode)) {
      return {
        payload: createEmptySuccessResponse(options.emptyData),
        unexpected: false,
      };
    }

    return {
      payload: createFallbackResponse<T>(statusCode, fallbackMessage),
      unexpected: true,
      reason: "empty-body" as const,
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
      reason: "non-json" as const,
    };
  }

  try {
    return normalizeApiResponse<T>(JSON.parse(text), statusCode, fallbackMessage, options);
  } catch {
    return {
      payload: createFallbackResponse<T>(statusCode, fallbackMessage),
      unexpected: true,
      reason: "invalid-json" as const,
    };
  }
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

export function resolveApiResponse<T>(
  data: unknown,
  statusCode: number,
  fallbackMessage: string,
  contentType?: string | null,
  options?: ResolveApiResponseOptions<T>,
) {
  if (data === null || data === undefined) {
    if (options?.allowEmptySuccess && isSuccessfulStatus(statusCode)) {
      return {
        payload: createEmptySuccessResponse(options.emptyData),
        unexpected: false,
      };
    }

    return {
      payload: createFallbackResponse<T>(statusCode, fallbackMessage),
      unexpected: true,
      reason: "empty-body" as const,
    };
  }

  if (typeof data === "string") {
    return parseApiResponseText<T>(
      data,
      statusCode,
      contentType,
      fallbackMessage,
      options,
    );
  }

  return normalizeApiResponse<T>(data, statusCode, fallbackMessage, options);
}

export function resolveApiResponseFromAxios<T>(
  response: AxiosResponse<unknown>,
  fallbackMessage: string,
  options?: ResolveApiResponseOptions<T>,
) {
  const contentType =
    typeof response.headers?.["content-type"] === "string"
      ? response.headers["content-type"]
      : null;

  return resolveApiResponse<T>(
    response.data,
    response.status,
    fallbackMessage,
    contentType,
    options,
  );
}

export function logUnexpectedApiResponse(
  response: AxiosResponse<unknown>,
  reason: UnexpectedApiResponseReason | undefined,
) {
  console.warn("Unexpected backend response", {
    path: response.config.url,
    status: response.status,
    contentType: response.headers?.["content-type"],
    reason,
  });
}

export function unwrapApiResponse<T>(
  response: AxiosResponse<unknown>,
  fallbackMessage: string,
  options?: ResolveApiResponseOptions<T>,
) {
  const { payload, unexpected, reason } = resolveApiResponseFromAxios<T>(
    response,
    fallbackMessage,
    options,
  );

  if (unexpected) {
    logUnexpectedApiResponse(response, reason);
  }

  if (!payload.success) {
    throw new Error(payload.error.message);
  }

  return payload.data;
}

export function getApiErrorStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function getApiErrorPayload<T>(
  error: unknown,
  fallbackMessage: string,
): ApiResponse<T> {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status ?? 500;
    const contentType =
      typeof error.response?.headers?.["content-type"] === "string"
        ? error.response.headers["content-type"]
        : null;

    return resolveApiResponse<T>(
      error.response?.data,
      statusCode,
      fallbackMessage,
      contentType,
    ).payload;
  }

  if (isApiResponseShape<T>(error)) {
    return error;
  }

  return createFallbackResponse<T>(500, fallbackMessage);
}

export function getApiErrorMessage<T>(
  error: unknown,
  fallbackMessage: string,
) {
  const payload = getApiErrorPayload<T>(error, fallbackMessage);
  return payload.success ? fallbackMessage : payload.error.message;
}

export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}
