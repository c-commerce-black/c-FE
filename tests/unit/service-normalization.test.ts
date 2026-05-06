import { afterEach, describe, expect, it, vi } from "vitest";

const { backendGet } = vi.hoisted(() => ({
  backendGet: vi.fn(),
}));

vi.mock("@/lib/shared/api/backend", () => ({
  backendApi: {
    get: backendGet,
  },
}));

import { getAlerts } from "@/lib/alerts/service";
import { getCart } from "@/lib/cart/service";
import { getProductFeedPage, getProducts } from "@/lib/catalog/service";
import { getOrders } from "@/lib/orders/service";
import { getSellerProducts } from "@/lib/seller/service";

afterEach(() => {
  backendGet.mockReset();
});

function createAxiosResponse<T>(data: T) {
  return {
    data,
    status: 200,
    statusText: "200",
    headers: { "content-type": "application/json" },
    config: { url: "/api/test" },
    request: {},
  };
}

describe("service response normalization", () => {
  it("normalizes product list payload aliases", async () => {
    backendGet.mockResolvedValueOnce(
      createAxiosResponse({
        success: true,
        data: {
          items: [
            {
              productId: "prod-1",
              title: "못난이 사과",
              category: "FOOD",
              basePrice: 10000,
              salePrice: 7000,
              stock: 3,
              expiresAt: "2026-04-10T00:00:00.000Z",
              discountPercent: 30,
            },
          ],
          meta: {
            currentPage: 2,
            size: 10,
            totalCount: 21,
            pageCount: 3,
          },
        },
      }),
    );

    const data = await getProducts({ page: 2, limit: 10 });

    expect(data).toEqual({
      products: [
        expect.objectContaining({
          id: "prod-1",
          name: "못난이 사과",
          currentPrice: 7000,
          originalPrice: 10000,
          category: "FOOD",
        }),
      ],
      pagination: {
        page: 2,
        limit: 10,
        total: 21,
        totalPages: 3,
      },
    });
  });

  it("forwards product feed search terms to backend pagination", async () => {
    backendGet.mockResolvedValueOnce(
      createAxiosResponse({
        success: true,
        data: {
          items: [
            {
              productId: "prod-1",
              title: "샐러드",
              category: "FOOD",
              price: 7000,
              stock: 5,
            },
          ],
          meta: {
            currentPage: 1,
            size: 3,
            totalCount: 1,
            pageCount: 1,
          },
        },
      }),
    );

    await getProductFeedPage({
      page: 1,
      limit: 3,
      category: "FOOD",
      sort: "expiry_asc",
      q: "샐러드",
    });

    expect(backendGet).toHaveBeenCalledWith("/api/products", {
      params: {
        page: 1,
        limit: 3,
        category: "FOOD",
        sort: "expiry_asc",
        status: undefined,
        q: "샐러드",
      },
    });
  });

  it("normalizes cart, alerts, orders, and seller dashboard payloads", async () => {
    backendGet
      .mockResolvedValueOnce(
        createAxiosResponse({
          success: true,
          data: {
            cartItems: [
              {
                id: "cart-1",
                quantity: 2,
                productInfo: {
                  productId: "prod-1",
                  title: "샐러드",
                  price: 4500,
                  originalPrice: 6000,
                  status: "EXPIRY_SOON",
                },
              },
            ],
            paymentSummary: {
              totalPrice: 12000,
              discountPrice: 3000,
              deliveryFee: 2500,
              paymentAmount: 9500,
            },
            hasPriceChanged: true,
          },
        }),
      )
      .mockResolvedValueOnce(
        createAxiosResponse({
          success: true,
          data: {
            alerts: [
              {
                id: "alert-1",
                enabled: true,
                targetProduct: {
                  productId: "prod-1",
                  title: "샐러드",
                  currentPrice: 4500,
                  remainingSeconds: 3600,
                },
              },
            ],
            specialDeals: [],
          },
        }),
      )
      .mockResolvedValueOnce(
        createAxiosResponse({
          success: true,
          data: {
            items: [
              {
                orderId: "order-1",
                status: "SHIPPING",
                totalPrice: 10000,
                discountPrice: 2000,
                deliveryFee: 2500,
                paymentAmount: 10500,
                address: "서울시 성동구",
                createdAt: 1710000000000,
                orderItems: [
                  {
                    productId: "prod-1",
                    productName: "샐러드",
                    quantity: 1,
                    currentPrice: 8000,
                  },
                ],
              },
            ],
          },
        }),
      )
      .mockResolvedValueOnce(
        createAxiosResponse({
          success: true,
          data: {
            salesToday: 55000,
            summary: {
              activeCount: 2,
              expiringCount: 1,
              ordersToday: 4,
            },
            items: [
              {
                productId: "prod-1",
                title: "샐러드",
                content: "오늘 입고",
                productCategory: "FOOD",
                basePrice: 9000,
                salePrice: 7000,
                remainingQuantity: 8,
                expiresAt: "2026-04-12",
                thumbnailUrl: "https://cdn.example/salad.png",
                productStatus: "EXPIRY_SOON",
                soldTodayCount: 3,
              },
            ],
          },
        }),
      );

    await expect(getCart("token")).resolves.toEqual(
      expect.objectContaining({
        priceChanged: true,
        items: [
          expect.objectContaining({
            cartItemId: "cart-1",
            product: expect.objectContaining({
              id: "prod-1",
              name: "샐러드",
              status: "EXPIRY_SOON",
            }),
          }),
        ],
      }),
    );

    await expect(getAlerts("token")).resolves.toEqual({
      wishAlerts: [
        expect.objectContaining({
          alertId: "alert-1",
          product: expect.objectContaining({
            id: "prod-1",
            name: "샐러드",
          }),
        }),
      ],
      todayDeals: [],
    });

    await expect(getOrders("token")).resolves.toEqual(
      expect.objectContaining({
        orders: [
          expect.objectContaining({
            id: "order-1",
            status: "SHIPPING",
            shippingAddress: "서울시 성동구",
          }),
        ],
      }),
    );

    await expect(getSellerProducts("token")).resolves.toEqual(
      expect.objectContaining({
        todaySales: 55000,
        stats: {
          onSale: 2,
          expirySoon: 1,
          todayOrders: 4,
        },
        products: [
          expect.objectContaining({
            id: "prod-1",
            name: "샐러드",
            description: "오늘 입고",
            category: "FOOD",
            originalPrice: 9000,
            currentPrice: 7000,
            stock: 8,
            status: "EXPIRY_SOON",
          }),
        ],
      }),
    );
  });
});
