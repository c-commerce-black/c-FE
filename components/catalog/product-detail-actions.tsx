"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/shared/ui";
import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "@/lib/shared/api";
import {
  useAddProductToCartMutation,
  useCreateProductAlertMutation,
} from "@/hooks/api";
import type { ProductDetail } from "@/lib/catalog";
import { cn, formatCurrency } from "@/lib/shared/utils";

type Feedback = {
  message: string;
  tone: "error" | "success";
};

const BLOCKED_PRODUCT_STATUSES = new Set<ProductDetail["status"]>([
  "SOLD_OUT",
  "EXPIRED",
  "DELETED",
]);

export function ProductDetailActions({
  product,
  initialRemainSeconds,
}: {
  product: ProductDetail;
  initialRemainSeconds: number;
}) {
  const router = useRouter();
  const availableStock = Math.max(0, Math.floor(product.stock));
  const isPurchasable =
    availableStock > 0 && !BLOCKED_PRODUCT_STATUSES.has(product.status);
  const [quantity, setQuantity] = useState(1);
  const [wishing, startWish] = useTransition();
  const [submitting, startSubmitting] = useTransition();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [remain, setRemain] = useState(initialRemainSeconds);
  const addToCartMutation = useAddProductToCartMutation();
  const createAlertMutation = useCreateProductAlertMutation();
  const selectedQuantity = isPurchasable
    ? Math.min(availableStock, Math.max(1, quantity))
    : 0;

  const total = useMemo(
    () => product.currentPrice * selectedQuantity,
    [product.currentPrice, selectedQuantity],
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
    if (!isPurchasable) {
      setFeedback({
        message: "현재 구매 가능한 수량이 없습니다.",
        tone: "error",
      });
      return;
    }

    if (selectedQuantity > availableStock) {
      setFeedback({
        message: `구매 가능 수량은 ${availableStock}개입니다.`,
        tone: "error",
      });
      return;
    }

    startSubmitting(async () => {
      setFeedback(null);
      try {
        await addToCartMutation.mutateAsync({
          productId: product.id,
          quantity: selectedQuantity,
        });
        router.push("/cart");
      } catch (error) {
        if (getApiErrorStatus(error) === 401) {
          router.push(`/login?next=${encodeURIComponent(`/products/${product.id}`)}`);
          return;
        }
        setFeedback({
          message: getApiErrorMessage(error, "장바구니에 담지 못했습니다."),
          tone: "error",
        });
      }
    });
  }

  async function handleWish() {
    startWish(async () => {
      setFeedback(null);
      try {
        await createAlertMutation.mutateAsync({
          productId: product.id,
        });
        setFeedback({
          message: "찜 목록에 추가했습니다.",
          tone: "success",
        });
      } catch (error) {
        if (getApiErrorStatus(error) === 401) {
          router.push(`/login?next=${encodeURIComponent(`/products/${product.id}`)}`);
          return;
        }
        setFeedback({
          message: getApiErrorMessage(error, "찜 처리에 실패했습니다."),
          tone: "error",
        });
      }
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
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[12px] font-black",
              isPurchasable
                ? "bg-success/10 text-success"
                : "bg-urgent/10 text-urgent",
            )}
          >
            {isPurchasable ? `구매 가능 ${availableStock}개` : "구매 불가"}
          </span>
        </div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#505c70]">
            선택 수량
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={!isPurchasable || selectedQuantity <= 1}
              className="flex size-10 items-center justify-center rounded-[10px] border border-border bg-surface-sunken text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="수량 감소"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-7 text-center text-[18px] font-black text-foreground">
              {selectedQuantity}
            </span>
            <button
              type="button"
              onClick={() =>
                setQuantity((value) => Math.min(availableStock, value + 1))
              }
              disabled={!isPurchasable || selectedQuantity >= availableStock}
              className="flex size-10 items-center justify-center rounded-[10px] bg-brand-primary text-white disabled:cursor-not-allowed disabled:opacity-40"
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
          disabled={wishing || createAlertMutation.isPending}
          className="shrink-0 rounded-[16px]"
          aria-label="찜하기"
        >
          <Heart className="size-5 text-brand-primary" />
        </Button>
        <Button
          className="flex-1 rounded-[16px]"
          size="lg"
          onClick={handleCart}
          disabled={!isPurchasable || submitting || addToCartMutation.isPending}
        >
          {submitting || addToCartMutation.isPending ? "담는 중..." : "지금 구매하기"}
        </Button>
      </div>
      {feedback ? (
        <p
          role={feedback.tone === "error" ? "alert" : "status"}
          className={cn(
            "rounded-[12px] border px-3 py-2 text-sm font-bold",
            feedback.tone === "error"
              ? "border-urgent/25 bg-urgent/10 text-urgent"
              : "border-success/25 bg-success/10 text-success",
          )}
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
