"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { useHomeProductsQuery } from "@/hooks/api";
import { CATEGORY_LABELS, getRemainSeconds } from "@/lib/catalog";
import { PAGE_FALLBACK_MESSAGE } from "@/lib/shared/types";
import { Card, EmptyState, PageFallbackNotice } from "@/components/shared/ui";
import { HomeHero } from "./home-hero";
import { HomePromoCarousel } from "./home-promo-carousel";
import { ProductCard } from "./product-card";

function HomeProductSkeleton({ index }: { index: number }) {
  return (
    <Card
      className="overflow-hidden rounded-[16px] border-[#edf1f6] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
      aria-hidden
    >
      <div className="flex gap-4">
        <div className="h-[76px] w-[76px] shrink-0 rounded-[16px] bg-surface-sunken" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-5 w-3/4 rounded-full bg-surface-sunken" />
          <div className="h-5 w-1/2 rounded-full bg-surface-sunken" />
          <div className="flex gap-2">
            <div className="h-7 w-16 rounded-full bg-surface-sunken" />
            <div className="h-7 w-16 rounded-full bg-surface-sunken" />
          </div>
        </div>
      </div>
      <span className="sr-only">홈 상품 로딩 중 {index + 1}</span>
    </Card>
  );
}

export function HomePageClient() {
  const homeProductsQuery = useHomeProductsQuery();
  const products = homeProductsQuery.data?.products ?? [];
  const heroProduct = products[0] ?? null;
  const hasQueryError = homeProductsQuery.isError;

  return (
    <div className="cc-grid space-y-6 py-0">
      {hasQueryError ? (
        <PageFallbackNotice message={PAGE_FALLBACK_MESSAGE} />
      ) : null}
      <HomeHero
        key={heroProduct?.id ?? "hero"}
        product={heroProduct}
        initialSeconds={heroProduct ? getRemainSeconds(heroProduct.expiryDate) : 0}
      />
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={`/explore?category=${key}`}
              className="shrink-0 rounded-full border border-[#e5eaf2] bg-white px-4 py-2 text-[13px] font-semibold text-foreground"
            >
              {label}
            </Link>
          ))}
        </div>
        <Link
          href="/explore"
          className="flex items-center justify-between rounded-[18px] border border-[#e8edf5] bg-[#fafbfd] px-4 py-3 text-[14px] text-text-secondary"
        >
          <span className="inline-flex items-center gap-2">
            <Search className="size-4" />
            카테고리에서 더 자세히 찾아보기
          </span>
          <ArrowRight className="size-4 text-brand-primary" />
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.02em] text-text-tertiary">
              오늘의 추천 특가
            </p>
            <h2 className="mt-1 text-[1.55rem] leading-[1.12] font-black tracking-[-0.05em] text-foreground">
              지금 바로 담기 좋은 상품
            </h2>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"
          >
            전체보기 <ArrowRight className="size-4" />
          </Link>
        </div>
        {homeProductsQuery.isPending ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <HomeProductSkeleton key={`home-product-skeleton-${index}`} index={index} />
            ))}
          </div>
        ) : products.length ? (
          <div className="grid grid-cols-1 gap-4">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} variant="home" />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              hasQueryError
                ? "지금 상품을 불러오지 못했습니다"
                : "지금 노출 중인 특가 상품이 없습니다"
            }
            description={
              hasQueryError
                ? "잠시 후 다시 확인해 주세요. 데이터 요청은 브라우저의 /api/products 호출로 다시 시도됩니다."
                : "백엔드에 등록된 상품이 생기면 홈에서 바로 보여드릴게요."
            }
            actionHref="/explore"
            actionLabel="탐색으로 이동"
          />
        )}
      </section>

      <HomePromoCarousel />

      <section className="space-y-3 pb-4">
        <Card className="p-5">
          <p className="text-[12px] font-semibold tracking-[0.02em] text-text-tertiary">
            빠르게 둘러보기
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { href: "/explore?sort=expiry_asc", title: "마감임박순", copy: "오늘 끝나는 특가부터" },
              { href: "/explore?sort=discount_desc", title: "할인율 높은순", copy: "할인 폭이 큰 상품만" },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-[16px] bg-[#fafbfd] px-4 py-4"
              >
                <p className="text-[15px] font-bold tracking-[-0.03em] text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-[13px] leading-5 text-text-secondary">{item.copy}</p>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
