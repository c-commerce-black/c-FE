"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/shared/ui";
import { Card } from "@/components/shared/ui";
import { Input } from "@/components/shared/ui";
import { getApiErrorMessage } from "@/lib/shared/api";
import {
  useClearCartMutation,
  useCreateOrderMutation,
  useDeleteCartItemMutation,
  useUpdateCartItemQuantityMutation,
} from "@/hooks/api";
import type { CartItem, CartState } from "@/lib/cart";
import { formatCurrency } from "@/lib/shared/utils";
import { useCheckoutStore } from "@/stores/checkout-store";

function getCartItemId(item: CartItem) {
  return item.cartItemId ?? item.id ?? item.product.id;
}

export function CartClient({ initialCart }: { initialCart: CartState }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(initialCart.items);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCheckoutSheet, setShowCheckoutSheet] = useState(false);
  const updateQuantityMutation = useUpdateCartItemQuantityMutation();
  const deleteCartItemMutation = useDeleteCartItemMutation();
  const clearCartMutation = useClearCartMutation();
  const createOrderMutation = useCreateOrderMutation();

  const shippingAddress = useCheckoutStore((state) => state.shippingAddress);
  const showPriceToast = useCheckoutStore((state) => state.showPriceToast);
  const setShippingAddress = useCheckoutStore((state) => state.setShippingAddress);
  const setSelectedCartItemIds = useCheckoutStore((state) => state.setSelectedCartItemIds);
  const setShowPriceToast = useCheckoutStore((state) => state.setShowPriceToast);

  useEffect(() => {
    setSelectedCartItemIds(items.map(getCartItemId));
  }, [items, setSelectedCartItemIds]);

  useEffect(() => {
    if (!initialCart.priceChanged) return;
    setShowPriceToast(true);
    const timer = window.setTimeout(() => setShowPriceToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [initialCart.priceChanged, setShowPriceToast]);

  const selectedItems = useMemo(() => items, [items]);

  const summary = useMemo(() => {
    const totalAmount = selectedItems.reduce(
      (sum, item) => sum + item.product.originalPrice * item.quantity,
      0,
    );
    const saleAmount = selectedItems.reduce(
      (sum, item) => sum + item.product.currentPrice * item.quantity,
      0,
    );
    const shippingFee = selectedItems.length ? 2500 : 0;
    return {
      totalAmount,
      discountAmount: totalAmount - saleAmount,
      shippingFee,
      finalAmount: saleAmount + shippingFee,
    };
  }, [selectedItems]);

  function updateQuantity(item: CartItem, quantity: number) {
    startTransition(async () => {
      setFeedback(null);
      const itemId = getCartItemId(item);
      try {
        await updateQuantityMutation.mutateAsync({ itemId, quantity });
      } catch (error) {
        setFeedback(getApiErrorMessage(error, "수량 변경에 실패했습니다."));
        return;
      }

      setItems((current) =>
        current.map((entry) =>
          getCartItemId(entry) === itemId ? { ...entry, quantity } : entry,
        ),
      );
    });
  }

  function checkout() {
    if (!shippingAddress.trim()) {
      setFeedback("배송지 주소를 입력해 주세요.");
      return;
    }
    if (!selectedItems.length) {
      setFeedback("주문할 상품을 선택해 주세요.");
      return;
    }

    startTransition(async () => {
      setFeedback(null);
      try {
        const data = await createOrderMutation.mutateAsync({
          cartItemIds: selectedItems.map(getCartItemId),
          shippingAddress,
        });

        setShowCheckoutSheet(false);
        router.push(`/orders/${data.order.id}/success`);
        router.refresh();
      } catch (error) {
        setFeedback(getApiErrorMessage(error, "주문 생성에 실패했습니다."));
        return;
      }
    });
  }

  function removeItem(item: CartItem) {
    startTransition(async () => {
      setFeedback(null);
      const itemId = getCartItemId(item);
      try {
        await deleteCartItemMutation.mutateAsync({ itemId });
        setItems((current) => current.filter((entry) => getCartItemId(entry) !== itemId));
      } catch (error) {
        setFeedback(getApiErrorMessage(error, "장바구니 상품 삭제에 실패했습니다."));
      }
    });
  }

  function clearCart() {
    startTransition(async () => {
      setFeedback(null);
      try {
        await clearCartMutation.mutateAsync();
        setItems([]);
      } catch (error) {
        setFeedback(getApiErrorMessage(error, "장바구니를 비우지 못했습니다."));
      }
    });
  }

  return (
    <div className="relative grid gap-6">
      {showPriceToast ? (
        <div className="cc-toast-enter fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-[182px] items-center justify-center gap-2 rounded-full bg-inverted px-4 py-3 text-[14px] font-semibold text-white shadow-[var(--cc-shadow-soft)]">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-warning text-inverted">
            !
          </span>
          큰 가격이 변동됩니다
        </div>
      ) : null}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-black tracking-[-0.05em] text-foreground">
              장바구니
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[14px] text-text-secondary">{items.length}개</span>
            {items.length ? (
              <button
                type="button"
                onClick={clearCart}
                className="text-[13px] font-semibold text-text-secondary"
                disabled={
                  pending ||
                  updateQuantityMutation.isPending ||
                  deleteCartItemMutation.isPending ||
                  clearCartMutation.isPending ||
                  createOrderMutation.isPending
                }
              >
                전체 비우기
              </button>
            ) : null}
          </div>
        </div>
        <div className="space-y-4">
          {items.map((item) => {
            return (
              <Card key={getCartItemId(item)} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-16 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,_#eefdf3,_#f8fffb)]">
                    <div className="size-7 rounded-full bg-[#b4f2c6]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="block text-[16px] font-black tracking-[-0.03em] text-foreground"
                    >
                      {item.product.name}
                    </Link>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-[#fff0f2] px-2 py-1 text-[12px] font-bold text-[#ff5f7e]">
                        D-{item.product.dDay ?? 0}
                      </span>
                      <span className="text-[16px] font-black text-brand-primary">
                        {formatCurrency(item.product.currentPrice)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item, Math.max(1, item.quantity - 1))
                      }
                      className="flex size-8 items-center justify-center rounded-[10px] border border-border bg-surface-sunken text-[#657185]"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="min-w-4 text-center text-[18px] font-black text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      className="flex size-8 items-center justify-center rounded-[10px] border border-[#ffd5ea] bg-white text-brand-primary"
                    >
                      <Plus className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      className="ml-1 flex size-8 items-center justify-center rounded-[10px] border border-border bg-white text-text-secondary"
                      aria-label="장바구니 상품 삭제"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
      <section className="space-y-4">
        <Card className="space-y-4 p-4">
          <div>
            <p className="text-[12px] font-semibold text-[#919caf]">주문 요약</p>
            <h2 className="mt-1 text-[16px] font-bold tracking-[-0.03em] text-foreground">
              주문 요약
            </h2>
          </div>
          <div className="space-y-3 text-[14px] text-[#5d6677]">
            <div className="flex items-center justify-between">
              <span>상품금액</span>
              <span className="font-semibold">{formatCurrency(summary.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>할인</span>
              <span className="font-semibold text-brand-secondary">
                -{formatCurrency(summary.discountAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>배송비</span>
              <span className="font-semibold">{formatCurrency(summary.shippingFee)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between text-[16px] font-bold text-foreground">
              <span>총 결제금액</span>
              <span className="text-[24px] font-black tracking-[-0.05em] text-brand-primary">
                {formatCurrency(summary.finalAmount)}
              </span>
            </div>
          </div>
          <Button
            size="lg"
            className="w-full"
            disabled={
              pending ||
              updateQuantityMutation.isPending ||
              deleteCartItemMutation.isPending ||
              clearCartMutation.isPending ||
              createOrderMutation.isPending ||
              !items.length
            }
            onClick={() => setShowCheckoutSheet(true)}
          >
            결제하기
          </Button>
          {feedback ? <p className="text-sm text-text-secondary">{feedback}</p> : null}
        </Card>
      </section>
      {showCheckoutSheet ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-inverted/30 px-4 pb-6">
          <Card className="w-full max-w-[396px] space-y-4 p-4">
            <div>
              <p className="text-[16px] font-black text-foreground">배송지 입력</p>
              <p className="mt-1 text-[13px] text-text-secondary">
                주문 생성 API에 필요한 배송지 주소를 입력해 주세요.
              </p>
            </div>
            <Input
              placeholder="서울시 강남구 테헤란로 123"
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCheckoutSheet(false)}
              >
                취소
              </Button>
              <Button
                className="flex-1"
                disabled={
                  pending ||
                  updateQuantityMutation.isPending ||
                  deleteCartItemMutation.isPending ||
                  clearCartMutation.isPending ||
                  createOrderMutation.isPending
                }
                onClick={() => {
                  void checkout();
                }}
              >
                {pending || createOrderMutation.isPending ? "결제 진행 중..." : "확인"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
