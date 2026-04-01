import { describe, expect, it } from "vitest";

import { createSessionAuthResponse } from "@/lib/auth/server";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  nickname: "테스트유저",
  sellerProfileId: "seller-1",
  shopName: "테스트상점",
};

describe("createSessionAuthResponse", () => {
  it("sets the session cookie when auth succeeds", () => {
    const response = createSessionAuthResponse({
      status: 200,
      fallbackMessage: "로그인에 실패했습니다.",
      payload: {
        success: true,
        data: {
          user: mockUser,
          accessToken: "access-token",
          expiresIn: 3600,
        },
      },
    });

    const setCookieHeader = response.headers.get("set-cookie");

    expect(response.status).toBe(200);
    expect(setCookieHeader).toContain("cc_access_token=access-token");
    expect(setCookieHeader).toContain("HttpOnly");
    expect(setCookieHeader).toContain("Path=/");
    expect(setCookieHeader).toContain("Max-Age=3600");
  });

  it("falls back without writing a cookie when payload is missing", async () => {
    const response = createSessionAuthResponse({
      status: 503,
      fallbackMessage: "로그인에 실패했습니다.",
      payload: undefined,
    });

    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        message: "로그인에 실패했습니다.",
        statusCode: 503,
      },
    });
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
