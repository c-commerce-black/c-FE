import { describe, expect, it } from "vitest";

import { readApiResponse, sanitizeUserMessage } from "@/lib/shared/api";

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
});
