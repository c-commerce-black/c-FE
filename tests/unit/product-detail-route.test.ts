import { describe, expect, it, vi } from "vitest";

const { backendGet, resolveApiResponseFromAxios, normalizeProductDetailData } = vi.hoisted(() => ({
  backendGet: vi.fn(),
  resolveApiResponseFromAxios: vi.fn(),
  normalizeProductDetailData: vi.fn(),
}));

vi.mock("@/lib/shared/api/backend", () => ({
  backendApi: {
    get: backendGet,
  },
}));

vi.mock("@/lib/shared/api", () => ({
  resolveApiResponseFromAxios,
}));

vi.mock("@/lib/catalog/service", async () => {
  return {
    normalizeProductDetailData,
  };
});

import { GET } from "@/app/api/products/[id]/route";

describe("/api/products/[id] route", () => {
  afterEach(() => {
    backendGet.mockReset();
    resolveApiResponseFromAxios.mockReset();
    normalizeProductDetailData.mockReset();
  });

  it("returns the normalized product detail envelope on success", async () => {
    const backendResponse = {
      data: { success: true, data: { id: "prod-1" } },
      status: 200,
      headers: { "content-type": "application/json" },
      config: { url: "/api/products/prod-1" },
    };

    backendGet.mockResolvedValue(backendResponse);
    resolveApiResponseFromAxios.mockReturnValue({
      payload: {
        success: true,
        data: { item: { id: "prod-1" } },
      },
    });
    normalizeProductDetailData.mockReturnValue({
      product: {
        id: "prod-1",
        name: "못난이 사과",
      },
    });

    const response = await GET(new Request("http://localhost:3000/api/products/prod-1"), {
      params: Promise.resolve({ id: "prod-1" }),
    });

    expect(backendGet).toHaveBeenCalledWith("/api/products/prod-1", {
      validateStatus: expect.any(Function),
    });
    expect(normalizeProductDetailData).toHaveBeenCalledWith({
      item: { id: "prod-1" },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        product: {
          id: "prod-1",
          name: "못난이 사과",
        },
      },
    });
  });

  it("preserves backend error status codes", async () => {
    const backendResponse = {
      data: { success: false, error: { message: "상품을 찾을 수 없습니다.", statusCode: 404 } },
      status: 404,
      headers: { "content-type": "application/json" },
      config: { url: "/api/products/missing" },
    };

    backendGet.mockResolvedValue(backendResponse);
    resolveApiResponseFromAxios.mockReturnValue({
      payload: {
        success: false,
        error: {
          message: "상품을 찾을 수 없습니다.",
          statusCode: 404,
        },
      },
    });

    const response = await GET(new Request("http://localhost:3000/api/products/missing"), {
      params: Promise.resolve({ id: "missing" }),
    });

    expect(normalizeProductDetailData).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        message: "상품을 찾을 수 없습니다.",
        statusCode: 404,
      },
    });
  });
});
