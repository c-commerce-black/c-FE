import { describe, expect, it, vi } from "vitest";

const { jsonError, proxyMultipart } = vi.hoisted(() => ({
  jsonError: vi.fn(),
  proxyMultipart: vi.fn(),
}));

vi.mock("@/lib/shared/api/server", () => ({
  jsonError,
  proxyMultipart,
}));

import { POST } from "@/app/api/uploads/images/route";

describe("/api/uploads/images route", () => {
  it("forwards multipart form data to the backend upload endpoint", async () => {
    const response = new Response(
      JSON.stringify({ success: true, data: { imageUrl: "https://cdn.example/test.png" } }),
      { status: 201 },
    );
    proxyMultipart.mockResolvedValue(response);

    const formData = new FormData();
    formData.append("image", new File(["binary"], "sample.png", { type: "image/png" }));

    const request = {
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown;

    const result = await POST(request as never);

    expect(proxyMultipart).toHaveBeenCalledTimes(1);
    const forwarded = proxyMultipart.mock.calls[0]?.[0];
    expect(forwarded.path).toBe("/api/uploads/images");
    expect(forwarded.auth).toBe(true);
    expect(forwarded.fallbackMessage).toBe("이미지 업로드에 실패했습니다.");
    expect(typeof forwarded.formData?.get).toBe("function");
    expect(forwarded.formData.get("image")).toBeTruthy();
    expect(result).toBe(response);
  });

  it("returns a safe error response when form parsing fails", async () => {
    const errorResponse = Response.json(
      {
        success: false,
        error: {
          message: "이미지 업로드 요청을 처리할 수 없습니다.",
          statusCode: 500,
        },
      },
      { status: 500 },
    );
    jsonError.mockReturnValue(errorResponse);

    const request = {
      formData: vi.fn().mockRejectedValue(new Error("broken body")),
    } as unknown as NextRequest;

    const result = await POST(request);

    expect(jsonError).toHaveBeenCalledWith("이미지 업로드 요청을 처리할 수 없습니다.");
    expect(result).toBe(errorResponse);
  });
});
