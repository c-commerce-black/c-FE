"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

import type { Product } from "@/lib/catalog";
import { splitDuration } from "@/lib/catalog";
import { formatCurrency } from "@/lib/shared/utils";

export function HomeHero({
  product,
  initialSeconds,
}: {
  product: Product | null;
  initialSeconds: number;
}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!product) return;
    const base = initialSeconds;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setSeconds(Math.max(0, base - elapsed));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [initialSeconds, product]);

  const { days, hours, minutes, seconds: remainSeconds } = splitDuration(
    hydrated ? seconds : initialSeconds,
  );

  return (
    <section className="space-y-4">
      <div className="space-y-2 px-1 pt-1">
        <p className="text-[11px] font-semibold tracking-[-0.02em] text-text-tertiary">
          C-commerce 마켓
        </p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[1.9rem] leading-[1.08] font-black tracking-[-0.06em] text-foreground">
              지금 사야 할
              <br />
              임박 특가
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">
              마감이 가장 빠른 상품부터 바로 보여드려요
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border px-4 text-[13px] font-semibold text-foreground"
          >
            탐색
          </Link>
        </div>
      </div>

      <Link
        href={product ? `/products/${product.id}` : "/explore"}
        className="block rounded-[20px] border border-[#e7edf5] bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.05)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.04em] text-brand-secondary">
              오늘 가장 임박한 상품
            </p>
            <h2 className="mt-2 text-[22px] leading-[1.2] font-black tracking-[-0.05em] text-foreground">
              {product?.name ?? "오늘의 임박 특가"}
            </h2>
          </div>
          <div className="rounded-full bg-[#fff3f9] px-3 py-1 text-[12px] font-bold text-brand-primary">
            D-{product?.dDay ?? 1}
          </div>
        </div>

        <div className="mt-4 flex items-end gap-2">
          <span className="text-[32px] leading-none font-black tracking-[-0.06em] text-foreground">
            {product ? formatCurrency(product.currentPrice) : "상품 준비 중"}
          </span>
          {product ? (
            <>
              <span className="pb-0.5 text-[14px] text-text-tertiary line-through">
                {formatCurrency(product.originalPrice)}
              </span>
              <span className="pb-0.5 text-[14px] font-bold text-brand-primary">
                {product.discountRate}% 할인
              </span>
            </>
          ) : null}
        </div>

        <div className="mt-5 rounded-[16px] bg-[#f7fafc] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-text-secondary">마감까지 남은 시간</p>
            </div>
            <Clock3 className="size-4 text-brand-primary" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              { label: "일", value: days },
              { label: "시", value: hours },
              { label: "분", value: minutes },
              { label: "초", value: remainSeconds },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[12px] border border-[#e7edf5] bg-white px-2 py-2.5 text-center"
              >
                <p className="text-[18px] leading-none font-black tracking-[-0.04em] text-foreground">
                  {String(item.value).padStart(2, "0")}
                </p>
                <p className="mt-1 text-[11px] font-medium text-text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-brand-primary">
          상품 상세 보기 <ArrowRight className="size-4" />
        </div>
      </Link>
    </section>
  );
}
