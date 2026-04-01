import { AxiosError, type AxiosRequestConfig, type AxiosResponseHeaders } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createApiInstance,
  getApiErrorMessage,
  resolveApiResponse,
  resolveApiResponseFromAxios,
  sanitizeUserMessage,
  unwrapApiResponse,
} from "@/lib/shared/api";

afterEach(() => {
  vi.restoreAllMocks();
});

function createAxiosResponse<T>({
  data,
  status,
  headers,
  config,
}: {
  data: T;
  status: number;
  headers?: AxiosResponseHeaders | Record<string, string>;
  config?: AxiosRequestConfig;
}) {
  return {
    data,
    status,
    statusText: String(status),
    headers: headers ?? {},
    config: config ?? { url: "/api/test" },
    request: {},
  };
}

describe("api error helpers", () => {
  it("falls back when the response body is an HTML document", () => {
    expect(
      resolveApiResponse(
        '<!DOCTYPE html><html><body><script src="https://files.cloudtype.io/errorpages/assets/app.js"></script></body></html>',
        500,
        "로그인에 실패했습니다.",
        "text/html; charset=utf-8",
      ),
    ).toEqual({
      payload: {
        success: false,
        error: {
          message: "로그인에 실패했습니다.",
          statusCode: 500,
        },
      },
      unexpected: true,
      reason: "non-json",
    });
  });

  it("falls back when JSON parsing fails", () => {
    expect(
      resolveApiResponse(
        '{"success": false,',
        502,
        "응답을 처리할 수 없습니다.",
        "application/json",
      ),
    ).toEqual({
      payload: {
        success: false,
        error: {
          message: "응답을 처리할 수 없습니다.",
          statusCode: 502,
        },
      },
      unexpected: true,
      reason: "invalid-json",
    });
  });

  it("marks empty axios responses with an explicit reason", () => {
    expect(
      resolveApiResponseFromAxios(
        createAxiosResponse({
          data: null,
          status: 204,
        }),
        "응답을 처리할 수 없습니다.",
      ),
    ).toMatchObject({
      unexpected: true,
      reason: "empty-body",
      payload: {
        success: false,
        error: {
          message: "응답을 처리할 수 없습니다.",
          statusCode: 204,
        },
      },
    });
  });

  it("treats an empty object as an unexpected response", () => {
    expect(
      resolveApiResponseFromAxios(
        createAxiosResponse({
          data: {},
          status: 200,
          headers: { "content-type": "application/json" },
        }),
        "응답을 처리할 수 없습니다.",
      ),
    ).toMatchObject({
      unexpected: true,
      reason: "empty-object",
      payload: {
        success: false,
        error: {
          message: "응답을 처리할 수 없습니다.",
          statusCode: 200,
        },
      },
    });
  });

  it("preserves short business messages from axios errors", () => {
    const response = createAxiosResponse({
      data: {
        success: false,
        error: {
          message: "이메일 또는 비밀번호를 확인해 주세요.",
          statusCode: 401,
        },
      },
      status: 401,
      headers: { "content-type": "application/json" },
      config: { url: "/api/auth/login" },
    });
    const error = new AxiosError("Request failed", "ERR_BAD_REQUEST", response.config, {}, response);

    expect(getApiErrorMessage(error, "로그인에 실패했습니다.")).toBe(
      "이메일 또는 비밀번호를 확인해 주세요.",
    );
  });

  it("sanitizes suspicious plain text messages", () => {
    expect(
      sanitizeUserMessage(
        "Error: connect ECONNREFUSED 127.0.0.1:5432 at /app/server.ts:12:4",
        "잠시 후 다시 시도해 주세요.",
      ),
    ).toBe("잠시 후 다시 시도해 주세요.");
  });

  it("unwraps successful api payloads from axios responses", () => {
    expect(
      unwrapApiResponse<{ message: string }>(
        createAxiosResponse({
          data: {
            success: true,
            data: { message: "로그아웃 되었습니다." },
          },
          status: 200,
          headers: { "content-type": "application/json" },
        }),
        "로그아웃에 실패했습니다.",
      ),
    ).toEqual({
      message: "로그아웃 되었습니다.",
    });
  });

  it("injects authorization headers when a token is provided", async () => {
    let capturedHeaders: unknown;
    const instance = createApiInstance({
      adapter: async (config) => {
        capturedHeaders = config.headers;
        return createAxiosResponse({
          data: { success: true, data: {} },
          status: 200,
          headers: { "content-type": "application/json" },
          config,
        });
      },
    });

    await instance.get("/api/auth/me", { token: "token-123" });

    const authHeader =
      typeof (capturedHeaders as { get?: (name: string) => string | undefined })?.get === "function"
        ? (capturedHeaders as { get: (name: string) => string | undefined }).get(
            "Authorization",
          )
        : (capturedHeaders as { Authorization?: string } | undefined)?.Authorization;

    expect(authHeader).toBe("Bearer token-123");
  });

  it("serializes params while skipping empty values", () => {
    const instance = createApiInstance();

    expect(
      instance.getUri({
        url: "/api/products",
        params: {
          page: 1,
          sort: "latest",
          q: "",
          category: null,
          includeSoldOut: false,
        },
      }),
    ).toBe("/api/products?page=1&sort=latest&includeSoldOut=false");
  });

  it("normalizes malformed axios error payloads in the response interceptor", async () => {
    const instance = createApiInstance({
      adapter: async (config) => {
        const response = createAxiosResponse({
          data: "<html>broken</html>",
          status: 502,
          headers: { "content-type": "text/html; charset=utf-8" },
          config,
        });

        throw new AxiosError("Bad gateway", "ERR_BAD_RESPONSE", config, {}, response);
      },
    });

    await expect(
      instance.get("/api/health", {
        fallbackMessage: "응답을 처리할 수 없습니다.",
      }),
    ).rejects.toMatchObject({
      response: {
        status: 502,
        data: {
          success: false,
          error: {
            message: "응답을 처리할 수 없습니다.",
            statusCode: 502,
          },
        },
      },
    });
  });
});
