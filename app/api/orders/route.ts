import { NextRequest } from "next/server";

import { getCart } from "@/lib/cart/service";
import type { CartItem } from "@/lib/cart";
import { getProductDetail } from "@/lib/catalog/service";
import type { ProductDetail } from "@/lib/catalog";
import {
  readArray,
  readRecord,
  resolveApiResponseFromAxios,
} from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";
import {
  getSessionTokenFromCookies,
  jsonApiResponse,
  jsonError,
  proxyJson,
} from "@/lib/shared/api/server";

const BLOCKED_PRODUCT_STATUSES = new Set<ProductDetail["status"]>([
  "SOLD_OUT",
  "EXPIRED",
  "DELETED",
]);
const productOrderLocks = new Map<string, Promise<void>>();

function getCartItemId(item: CartItem) {
  return item.cartItemId ?? item.id ?? item.product.id;
}

function readCartItemIds(body: unknown) {
  const record = readRecord(body);
  return readArray(record?.cartItemIds).filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );
}

function createStockConflictMessage(item: CartItem, product: ProductDetail) {
  const productName = product.name || item.product.name;
  const stock = Math.max(0, Math.floor(product.stock));
  if (BLOCKED_PRODUCT_STATUSES.has(product.status) || stock <= 0) {
    return `${productName} 상품은 현재 구매할 수 없습니다.`;
  }

  if (item.quantity > stock) {
    return `${productName} 구매 가능 수량은 ${stock}개입니다.`;
  }

  return null;
}

async function resolveSelectedCartItems(body: unknown, token: string) {
  const cartItemIds = readCartItemIds(body);
  if (!cartItemIds.length) {
    return {
      error: jsonError("주문할 상품을 선택해 주세요.", 400),
      items: [],
    };
  }

  let cart: Awaited<ReturnType<typeof getCart>>;
  try {
    cart = await getCart(token);
  } catch {
    return {
      error: jsonError("최신 장바구니 정보를 확인하지 못했습니다.", 409),
      items: [],
    };
  }

  const cartItemsById = new Map(
    cart.items.map((item) => [getCartItemId(item), item]),
  );
  const selectedItems = cartItemIds
    .map((id) => cartItemsById.get(id))
    .filter((item): item is CartItem => Boolean(item));

  if (selectedItems.length !== cartItemIds.length) {
    return {
      error: jsonError(
        "장바구니 상품 정보가 변경되었습니다. 새로고침 후 다시 시도해 주세요.",
        409,
      ),
      items: [],
    };
  }

  return {
    error: null,
    items: selectedItems,
  };
}

function getLockKey(item: CartItem) {
  return item.product.id || getCartItemId(item);
}

async function withProductOrderLock<T>(
  items: CartItem[],
  action: () => Promise<T>,
): Promise<T> {
  const keys = Array.from(new Set(items.map(getLockKey))).sort();
  const previousLocks = keys
    .map((key) => productOrderLocks.get(key))
    .filter((lock): lock is Promise<void> => Boolean(lock));
  let release: () => void = () => {};
  const currentLock = new Promise<void>((resolve) => {
    release = resolve;
  });
  keys.forEach((key) => productOrderLocks.set(key, currentLock));

  try {
    await Promise.all(previousLocks);
    return await action();
  } finally {
    keys.forEach((key) => {
      if (productOrderLocks.get(key) === currentLock) {
        productOrderLocks.delete(key);
      }
    });
    release();
  }
}

async function validateLatestStock(items: CartItem[]) {
  try {
    const products = await Promise.all(
      items.map(async (item) => {
        if (!item.product.id) {
          throw new Error("missing product id");
        }

        const data = await getProductDetail(item.product.id);
        return {
          item,
          product: data.product,
        };
      }),
    );

    const conflict = products
      .map(({ item, product }) => createStockConflictMessage(item, product))
      .find((message): message is string => Boolean(message));

    if (conflict) {
      return jsonError(`${conflict} 장바구니 수량을 조정해 주세요.`, 409);
    }
  } catch {
    return jsonError("최신 재고 정보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.", 409);
  }

  return null;
}

async function createBackendOrder(body: unknown, token: string) {
  const response = await backendApi.request({
    url: "/api/orders",
    method: "POST",
    data: body,
    token,
    validateStatus: () => true,
  });
  const { payload } = resolveApiResponseFromAxios(
    response,
    "주문 생성에 실패했습니다.",
  );

  return jsonApiResponse({
    status: response.status,
    payload,
    fallbackMessage: "주문 생성에 실패했습니다.",
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  return proxyJson({
    path: "/api/orders",
    method: "GET",
    auth: true,
    fallbackMessage: "주문 목록을 불러오지 못했습니다.",
    query: {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = await getSessionTokenFromCookies();
  if (!token) {
    return jsonError("로그인이 필요합니다.", 401);
  }

  const initialSelection = await resolveSelectedCartItems(body, token);
  if (initialSelection.error) {
    return initialSelection.error;
  }

  return withProductOrderLock(initialSelection.items, async () => {
    const latestSelection = await resolveSelectedCartItems(body, token);
    if (latestSelection.error) {
      return latestSelection.error;
    }

    const validationError = await validateLatestStock(latestSelection.items);
    if (validationError) {
      return validationError;
    }

    return createBackendOrder(body, token);
  });
}
