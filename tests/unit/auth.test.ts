import { describe, expect, it } from "vitest";

import { getSessionCookieOptions } from "@/lib/auth/server";

describe("session cookie options", () => {
  it("returns the expected cookie descriptor", () => {
    expect(getSessionCookieOptions()).toMatchObject({
      name: "cc_access_token",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  });
});
