import { afterEach, describe, expect, it, vi } from "vitest";

import { requestBackend, readApiResponse, readApiResponseWithMeta, sanitizeUserMessage } from "@/lib/shared/api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("api error helpers", () => {
  it("falls back when the response body is an HTML document", async () => {
    const response = new Response(
      '<!DOCTYPE html><html><body><script src="https://files.cloudtype.io/errorpages/assets/app.js"></script></body></html>',
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      },
    );

    await expect(
      readApiResponse(response, "로그인에 실패했습니다."),
    ).resolves.toEqual({
      success: false,
      error: {
        message: "로그인에 실패했습니다.",
        statusCode: 500,
      },
    });
  });

  it("falls back when JSON parsing fails", async () => {
    const response = new Response('{"success": false,', {
      status: 502,
      headers: {
        "Content-Type": "application/json",
      },
    });

    await expect(
      readApiResponse(response, "응답을 처리할 수 없습니다."),
    ).resolves.toEqual({
      success: false,
      error: {
        message: "응답을 처리할 수 없습니다.",
        statusCode: 502,
      },
    });
  });

  it("marks empty responses with an explicit reason", async () => {
    const response = new Response(null, { status: 204 });

    await expect(
      readApiResponseWithMeta(response, "응답을 처리할 수 없습니다."),
    ).resolves.toMatchObject({
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

  it("treats an empty object as an unexpected response", async () => {
    const response = Response.json({}, { status: 200 });

    await expect(
      readApiResponseWithMeta(response, "응답을 처리할 수 없습니다."),
    ).resolves.toMatchObject({
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

  it("preserves short business messages", async () => {
    const response = Response.json(
      {
        success: false,
        error: {
          message: "이메일 또는 비밀번호를 확인해 주세요.",
          statusCode: 401,
        },
      },
      { status: 401 },
    );

    await expect(
      readApiResponse(response, "로그인에 실패했습니다."),
    ).resolves.toEqual({
      success: false,
      error: {
        message: "이메일 또는 비밀번호를 확인해 주세요.",
        statusCode: 401,
      },
    });
  });

  it("sanitizes suspicious plain text messages", () => {
    expect(
      sanitizeUserMessage(
        "Error: connect ECONNREFUSED 127.0.0.1:5432 at /app/server.ts:12:4",
        "잠시 후 다시 시도해 주세요.",
      ),
    ).toBe("잠시 후 다시 시도해 주세요.");
  });

  it("normalizes empty success responses when explicitly allowed", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      requestBackend("/api/auth/logout", {
        method: "POST",
        emptyResponsePayload: {
          success: true,
          data: { message: "로그아웃 되었습니다." },
        },
      }),
    ).resolves.toEqual({
      ok: true,
      status: 204,
      payload: {
        success: true,
        data: { message: "로그아웃 되었습니다." },
      },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
