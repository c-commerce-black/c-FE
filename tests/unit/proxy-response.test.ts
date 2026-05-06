import { afterEach, describe, expect, it, vi } from "vitest";

const { backendRequest, cookies } = vi.hoisted(() => ({
  backendRequest: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("@/lib/shared/api/backend", () => ({
  backendApi: {
    request: backendRequest,
  },
}));

import { proxyJson } from "@/lib/shared/api/server";

function createAxiosResponse(data: unknown, status = 200) {
  return {
    data,
    status,
    statusText: String(status),
    headers: { "content-type": "application/json" },
    config: { url: "/api/test" },
    request: {},
  };
}

describe("server api proxy helpers", () => {
  afterEach(() => {
    backendRequest.mockReset();
    cookies.mockReset();
  });

  it("returns a structured 503 response when the backend request fails", async () => {
    backendRequest.mockRejectedValue(new Error("ECONNREFUSED"));

    const response = await proxyJson({
      path: "/api/cart",
      method: "GET",
      fallbackMessage: "장바구니를 불러오지 못했습니다.",
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        message: "장바구니를 불러오지 못했습니다.",
        statusCode: 503,
      },
    });
  });

  it("can preserve successful empty mutation responses when explicitly enabled", async () => {
    backendRequest.mockResolvedValue(createAxiosResponse({}, 200));

    const response = await proxyJson({
      path: "/api/seller/products/prod-1",
      method: "DELETE",
      fallbackMessage: "상품 삭제에 실패했습니다.",
      allowEmptySuccess: true,
      emptyData: {
        message: "삭제되었습니다.",
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        message: "삭제되었습니다.",
      },
    });
  });
});
