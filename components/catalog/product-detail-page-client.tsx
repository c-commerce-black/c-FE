"use client";

import Link from "next/link";

import { Card, PageFallbackNotice } from "@/components/shared/ui";
import { useProductDetailQuery } from "@/hooks/api";
import {
  CATEGORY_LABELS,
  getRemainSeconds,
} from "@/lib/catalog";
import { PAGE_FALLBACK_MESSAGE } from "@/lib/shared/types";
import { formatCurrency, serializeJson } from "@/lib/shared/utils";
import { PriceHistoryChart } from "./price-history-chart";
import { ProductDetailActions } from "./product-detail-actions";

function ProductDetailSkeleton() {
  return (
    <div className="cc-grid space-y-6 py-5">
      <section className="space-y-4 pt-1" aria-hidden>
        <div className="border-b border-border pb-4">
          <div className="h-4 w-28 rounded-full bg-surface-sunken" />
          <div className="mt-3 h-8 w-3/4 rounded-full bg-surface-sunken" />
          <div className="mt-4 flex items-end gap-2">
            <div className="h-10 w-36 rounded-full bg-surface-sunken" />
            <div className="h-5 w-20 rounded-full bg-surface-sunken" />
            <div className="h-5 w-16 rounded-full bg-surface-sunken" />
          </div>
        </div>
        <Card className="space-y-3 p-4">
          <div className="h-5 w-28 rounded-full bg-surface-sunken" />
          <div className="h-[120px] rounded-[16px] bg-surface-sunken" />
        </Card>
        <Card className="space-y-4 p-4">
          <div className="h-5 w-24 rounded-full bg-surface-sunken" />
          <div className="grid grid-cols-3 gap-2.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`product-detail-timer-skeleton-${index}`}
                className="h-16 rounded-[14px] bg-surface-sunken"
              />
            ))}
          </div>
          <div className="h-16 rounded-[14px] bg-surface-sunken" />
          <div className="flex gap-2.5">
            <div className="h-12 w-12 rounded-[16px] bg-surface-sunken" />
            <div className="h-12 flex-1 rounded-[16px] bg-surface-sunken" />
          </div>
        </Card>
      </section>
    </div>
  );
}

export function ProductDetailPageClient({
  productId,
}: {
  productId: string;
}) {
  const productDetailQuery = useProductDetailQuery(productId);
  const product = productDetailQuery.data?.product ?? null;
  const hasQueryError = productDetailQuery.isError;

  if (productDetailQuery.isPending) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="cc-grid space-y-6 py-5">
        {hasQueryError ? <PageFallbackNotice message={PAGE_FALLBACK_MESSAGE} /> : null}
        <Card className="space-y-4 p-5">
          <p className="text-[20px] font-black tracking-[-0.04em] text-foreground">
            상품 정보를 불러오지 못했습니다
          </p>
          <p className="text-[14px] leading-6 text-text-secondary">
            상품이 삭제되었거나 브라우저의 /api/products/{productId} 요청을 완료하지 못했습니다.
          </p>
          <div className="flex gap-2">
            <Link
              href="/explore"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-[16px] border border-border bg-white px-5 text-[15px] font-semibold text-foreground transition hover:bg-surface-sunken"
            >
              탐색으로 이동
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-[16px] bg-brand-primary px-5 text-[15px] font-semibold text-white transition hover:bg-brand-primary-hover"
            >
              홈으로 이동
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.name,
    category: CATEGORY_LABELS[product.category],
    image: product.imageUrl ? [product.imageUrl] : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "KRW",
      price: product.currentPrice,
      availability:
        product.status === "SOLD_OUT"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <div className="cc-grid space-y-6 py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJson(jsonLd) }}
      />
      <section className="space-y-4 pt-1">
        <div className="border-b border-border pb-4">
          <p className="text-[14px] text-[#a0aaba]">C-commerce 마켓</p>
          <h1 className="mt-2 text-[20px] font-black tracking-[-0.04em] text-foreground">
            {product.name}
          </h1>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-[30px] leading-none font-black tracking-[-0.06em] text-foreground">
              {formatCurrency(product.currentPrice)}
            </p>
            <p className="pb-0.5 text-[14px] text-[#9ca6b6] line-through">
              {formatCurrency(product.originalPrice)}
            </p>
            <p className="pb-0.5 text-[14px] font-bold text-brand-primary">
              {product.discountRate}% ↓
            </p>
          </div>
        </div>
        <PriceHistoryChart points={product.priceHistory ?? []} />
        <ProductDetailActions
          product={product}
          initialRemainSeconds={getRemainSeconds(product.expiryDate)}
        />
      </section>
    </div>
  );
}
