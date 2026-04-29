import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const {
  backendRequest,
  cookies,
  getCart,
  getProductDetail,
  proxyJson,
} = vi.hoisted(() => ({
  backendRequest: vi.fn(),
  cookies: vi.fn(),
  getCart: vi.fn(),
  getProductDetail: vi.fn(),
  proxyJson: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("@/lib/cart/service", () => ({
  getCart,
}));

vi.mock("@/lib/catalog/service", () => ({
  getProductDetail,
}));

vi.mock("@/lib/shared/api/backend", () => ({
  backendApi: {
    request: backendRequest,
  },
}));

vi.mock("@/lib/shared/api", () => ({
  readArray: (value: unknown) => (Array.isArray(value) ? value : []),
  readRecord: (value: unknown) =>
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : null,
  resolveApiResponseFromAxios: (response: { data: unknown; status: number }) => ({
    payload:
      typeof response.data === "object" && response.data !== null
        ? response.data
        : {
            success: false,
            error: {
              message: "주문 생성에 실패했습니다.",
              statusCode: response.status,
            },
          },
  }),
}));

vi.mock("@/lib/shared/api/server", () => ({
  getSessionTokenFromCookies: async () => {
    const cookieStore = await cookies();
    return cookieStore.get("session")?.value ?? null;
  },
  jsonApiResponse: ({
    status,
    payload,
  }: {
    status: number;
    payload: unknown;
  }) => Response.json(payload, { status }),
  jsonError: (message: string, status = 500) =>
    Response.json(
      {
        success: false,
        error: {
          message,
          statusCode: status,
        },
      },
      { status },
    ),
  proxyJson,
}));

import { POST } from "@/app/api/orders/route";

function mockSessionToken(token: string | null) {
  cookies.mockResolvedValue({
    get: vi.fn(() => (token ? { value: token } : undefined)),
  });
}

function createRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

function createAxiosResponse(data: unknown, status = 200) {
  return {
    data,
    status,
    headers: { "content-type": "application/json" },
    config: { url: "/api/orders" },
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return {
    promise,
    resolve,
  };
}

function createCartItem(quantity: number) {
  return {
    cartItemId: "cart-1",
    id: "cart-1",
    quantity,
    product: {
      id: "prod-1",
      name: "샐러드",
      currentPrice: 4500,
      originalPrice: 6000,
      status: "ON_SALE",
      imageUrl: null,
      dDay: 1,
      discountRate: 25,
      stock: null,
    },
  };
}

describe("/api/orders route", () => {
  afterEach(() => {
    backendRequest.mockReset();
    cookies.mockReset();
    getCart.mockReset();
    getProductDetail.mockReset();
  });

  it("validates the latest product stock before creating an order", async () => {
    mockSessionToken("token");
    getCart.mockResolvedValue({
      items: [createCartItem(2)],
      summary: {
        totalAmount: 12000,
        discountAmount: 3000,
        shippingFee: 2500,
        finalAmount: 9500,
      },
      priceChanged: false,
    });
    getProductDetail.mockResolvedValue({
      product: {
        id: "prod-1",
        name: "샐러드",
        status: "ON_SALE",
        stock: 1,
      },
    });

    const response = await POST(
      createRequest({
        cartItemIds: ["cart-1"],
        shippingAddress: "서울시 성동구",
      }),
    );

    expect(backendRequest).not.toHaveBeenCalled();
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        message: "샐러드 구매 가능 수량은 1개입니다. 장바구니 수량을 조정해 주세요.",
        statusCode: 409,
      },
    });
  });

  it("forwards the order when the latest stock can satisfy the cart quantity", async () => {
    const body = {
      cartItemIds: ["cart-1"],
      shippingAddress: "서울시 성동구",
    };

    mockSessionToken("token");
    getCart.mockResolvedValue({
      items: [createCartItem(1)],
      summary: {
        totalAmount: 6000,
        discountAmount: 1500,
        shippingFee: 2500,
        finalAmount: 7000,
      },
      priceChanged: false,
    });
    getProductDetail.mockResolvedValue({
      product: {
        id: "prod-1",
        name: "샐러드",
        status: "ON_SALE",
        stock: 3,
      },
    });
    backendRequest.mockResolvedValue(
      createAxiosResponse({
        success: true,
        data: {
          order: {
            id: "order-1",
          },
        },
      }),
    );

    const response = await POST(createRequest(body));

    expect(backendRequest).toHaveBeenCalledWith({
      url: "/api/orders",
      method: "POST",
      data: body,
      token: "token",
      validateStatus: expect.any(Function),
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        order: {
          id: "order-1",
        },
      },
    });
  });

  it("serializes same-product order creation before checking the next stock snapshot", async () => {
    const body = {
      cartItemIds: ["cart-1"],
      shippingAddress: "서울시 성동구",
    };
    const firstOrder = createDeferred<ReturnType<typeof createAxiosResponse>>();

    mockSessionToken("token");
    getCart.mockResolvedValue({
      items: [createCartItem(1)],
      summary: {
        totalAmount: 6000,
        discountAmount: 1500,
        shippingFee: 2500,
        finalAmount: 7000,
      },
      priceChanged: false,
    });
    getProductDetail
      .mockResolvedValueOnce({
        product: {
          id: "prod-1",
          name: "샐러드",
          status: "ON_SALE",
          stock: 1,
        },
      })
      .mockResolvedValueOnce({
        product: {
          id: "prod-1",
          name: "샐러드",
          status: "SOLD_OUT",
          stock: 0,
        },
      });
    backendRequest.mockReturnValueOnce(firstOrder.promise);

    const firstResponsePromise = POST(createRequest(body));
    const secondResponsePromise = POST(createRequest(body));

    await vi.waitFor(() => {
      expect(backendRequest).toHaveBeenCalledTimes(1);
    });
    expect(getProductDetail).toHaveBeenCalledTimes(1);

    firstOrder.resolve(
      createAxiosResponse({
        success: true,
        data: {
          order: {
            id: "order-1",
          },
        },
      }),
    );

    const [firstResponse, secondResponse] = await Promise.all([
      firstResponsePromise,
      secondResponsePromise,
    ]);

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(409);
    expect(backendRequest).toHaveBeenCalledTimes(1);
    expect(getProductDetail).toHaveBeenCalledTimes(2);
    await expect(secondResponse.json()).resolves.toEqual({
      success: false,
      error: {
        message: "샐러드 상품은 현재 구매할 수 없습니다. 장바구니 수량을 조정해 주세요.",
        statusCode: 409,
      },
    });
  });
});
