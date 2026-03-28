"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/shared/ui";
import { getApiErrorMessage, requestApi } from "@/lib/shared/api";
import type { ProductDetail } from "@/lib/catalog";
import { formatCurrency } from "@/lib/shared/utils";

export function ProductDetailActions({
  product,
  initialRemainSeconds,
}: {
  product: ProductDetail;
  initialRemainSeconds: number;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [wishing, startWish] = useTransition();
  const [submitting, startSubmitting] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [remain, setRemain] = useState(initialRemainSeconds);

  const total = useMemo(
    () => product.currentPrice * quantity,
    [product.currentPrice, quantity],
  );

  useEffect(() => {
    const base = initialRemainSeconds;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setRemain(Math.max(0, base - elapsed));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [initialRemainSeconds, product.id]);

  async function handleCart() {
    startSubmitting(async () => {
      setFeedback(null);
      const { ok, status, payload } = await requestApi("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      }, "장바구니에 담지 못했습니다.");

      if (!ok || !payload.success) {
        if (status === 401) {
          router.push(`/login?next=${encodeURIComponent(`/products/${product.id}`)}`);
          return;
        }
        setFeedback(getApiErrorMessage(payload, "장바구니에 담지 못했습니다."));
        return;
      }

      router.push("/cart");
    });
  }

  async function handleWish() {
    startWish(async () => {
      setFeedback(null);
      const { ok, status, payload } = await requestApi("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
        }),
      }, "찜 처리에 실패했습니다.");
      if (!ok || !payload.success) {
        if (status === 401) {
          router.push(`/login?next=${encodeURIComponent(`/products/${product.id}`)}`);
          return;
        }
        setFeedback(getApiErrorMessage(payload, "찜 처리에 실패했습니다."));
        return;
      }

      setFeedback("찜 목록에 추가했습니다.");
    });
  }

  return (
    <div className="space-y-7">
      <div className="border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[16px] font-bold tracking-[-0.03em] text-foreground">
            유통기한까지
          </h3>
          <span className="text-[12px] text-[#9aa3b2]">{product.expiryDate} 까지</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              label: "일",
              value: String(Math.floor(remain / 86400)).padStart(2, "0"),
            },
            {
              label: "시간",
              value: String(Math.floor((remain % 86400) / 3600)).padStart(2, "0"),
            },
            {
              label: "분",
              value: String(Math.floor((remain % 3600) / 60)).padStart(2, "0"),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[14px] border border-[#99e2e7] bg-[#e9fbfe] px-2 py-3 text-center"
            >
              <div className="text-[14px] font-black text-brand-secondary">{item.value}</div>
              <div className="mt-1 text-[11px] text-[#7a889c]">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[16px] font-bold tracking-[-0.03em] text-foreground">
            수량
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex size-10 items-center justify-center rounded-[10px] border border-border bg-surface-sunken text-foreground"
              aria-label="수량 감소"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-7 text-center text-[18px] font-black text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                setQuantity((value) => Math.min(product.stock || value + 1, value + 1))
              }
              className="flex size-10 items-center justify-center rounded-[10px] bg-brand-primary text-white"
              aria-label="수량 증가"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
        <div className="rounded-[14px] border border-brand-primary/25 bg-brand-primary-muted/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#505c70]">총 금액</span>
            <span className="text-[18px] font-black text-foreground">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5">
        <Button
          variant="outline"
          size="icon"
          onClick={handleWish}
          disabled={wishing}
          className="shrink-0 rounded-[16px]"
          aria-label="찜하기"
        >
          <Heart className="size-5 text-brand-primary" />
        </Button>
        <Button
          className="flex-1 rounded-[16px]"
          size="lg"
          onClick={handleCart}
          disabled={submitting}
        >
          {submitting ? "담는 중..." : "지금 구매하기"}
        </Button>
      </div>
      {feedback ? <p className="text-sm text-text-secondary">{feedback}</p> : null}
    </div>
  );
}
