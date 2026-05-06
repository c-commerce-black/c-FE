import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { appApiGet, unwrapApiResponse } = vi.hoisted(() => ({
  appApiGet: vi.fn(),
  unwrapApiResponse: vi.fn(),
}));

vi.mock("@/lib/shared/api", () => ({
  appApi: {
    get: appApiGet,
    post: vi.fn(),
  },
  unwrapApiResponse,
}));

import {
  catalogQueryKeys,
  useExploreFeedQuery,
  useHomeProductsQuery,
  useProductDetailQuery,
} from "@/hooks/api";
import { EXPLORE_PAGE_SIZE } from "@/lib/catalog";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("catalog query hooks", () => {
  afterEach(() => {
    appApiGet.mockReset();
    unwrapApiResponse.mockReset();
  });

  it("loads home products through the /api/products bff route", async () => {
    const payload = {
      products: [
        {
          id: "prod-1",
          name: "못난이 사과",
        },
      ],
      pagination: {
        page: 1,
        limit: 8,
        total: 1,
        totalPages: 1,
      },
    };

    appApiGet.mockResolvedValue({ data: {} });
    unwrapApiResponse.mockReturnValue(payload);

    const { result } = renderHook(() => useHomeProductsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(appApiGet).toHaveBeenCalledWith("/api/products", {
      params: {
        limit: 8,
        sort: "expiry_asc",
      },
    });
    expect(result.current.data).toEqual(payload);
  });

  it("loads the first explore page through /api/products/feed", async () => {
    const payload = {
      items: [
        {
          id: "prod-2",
          name: "샐러드",
        },
      ],
      nextPage: 2,
      hasMore: true,
      total: 12,
    };

    appApiGet.mockResolvedValue({ data: {} });
    unwrapApiResponse.mockReturnValue(payload);

    const { result } = renderHook(
      () =>
        useExploreFeedQuery({
          category: "FOOD",
          sort: "expiry_asc",
          q: "샐러드",
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(appApiGet).toHaveBeenCalledWith("/api/products/feed", {
      params: {
        page: 1,
        limit: EXPLORE_PAGE_SIZE,
        sort: "expiry_asc",
        category: "FOOD",
        q: "샐러드",
      },
    });
    expect(result.current.data).toEqual(payload);
  });

  it("separates product detail queries by product id", async () => {
    appApiGet.mockResolvedValue({ data: {} });
    unwrapApiResponse.mockReturnValue({
      product: {
        id: "prod-1",
        name: "상세 상품",
      },
    });

    const { result } = renderHook(() => useProductDetailQuery("prod-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(appApiGet).toHaveBeenCalledWith("/api/products/prod-1");
    expect(catalogQueryKeys.productDetail("prod-1")).not.toEqual(
      catalogQueryKeys.productDetail("prod-2"),
    );
  });
});
