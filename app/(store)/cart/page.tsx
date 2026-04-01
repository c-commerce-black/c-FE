import { CartClient } from "@/components/cart";
import { EmptyState } from "@/components/shared/ui";
import { PageFallbackNotice } from "@/components/shared/ui";
import { getSessionToken, requireUser } from "@/lib/auth/server";
import { getCart } from "@/lib/cart";
import { createPageLoadState, type PageLoadState } from "@/lib/shared/types";

async function getCartPageData(token: string): Promise<{
  cart: Awaited<ReturnType<typeof getCart>>;
  loadState: PageLoadState;
}> {
  try {
    return {
      cart: await getCart(token),
      loadState: createPageLoadState(),
    };
  } catch {
    return {
      cart: {
        items: [],
        summary: {
          totalAmount: 0,
          discountAmount: 0,
          shippingFee: 0,
          finalAmount: 0,
        },
        priceChanged: false,
      },
      loadState: createPageLoadState(true),
    };
  }
}

export default async function CartPage() {
  await requireUser("/cart");
  const token = await getSessionToken();
  const { cart, loadState } = await getCartPageData(token as string);

  return (
    <div className="cc-grid space-y-4 py-5">
      {loadState.isFallback && loadState.message ? (
        <PageFallbackNotice message={loadState.message} />
      ) : null}
      {cart.items.length ? (
        <CartClient initialCart={cart} />
      ) : (
        <EmptyState
          title="장바구니가 비어 있습니다"
          description="지금 탐색 화면에서 임박특가 상품을 담아보세요. 가격 변경 알림은 상품을 담은 뒤 자동으로 반영됩니다."
          actionHref="/explore"
          actionLabel="상품 둘러보기"
        />
      )}
    </div>
  );
}
