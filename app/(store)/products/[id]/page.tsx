import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import { PriceHistoryChart } from "@/components/catalog";
import { ProductDetailActions } from "@/components/catalog";
import {
  CATEGORY_LABELS,
  getProductDetail,
  getRemainSeconds,
} from "@/lib/catalog";
import { formatCurrency, serializeJson } from "@/lib/shared/utils";

const getProduct = cache(async (id: string) => {
  try {
    return await getProductDetail(id);
  } catch {
    return null;
  }
});

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getProduct(id);
  if (!data?.product) {
    return {
      title: "상품을 찾을 수 없습니다",
    };
  }

  const product = data.product;

  return {
    title: product.name,
    description: `${CATEGORY_LABELS[product.category]} · ${formatCurrency(
      product.currentPrice,
    )} · D-${product.dDay} 특가 상품`,
    openGraph: {
      title: product.name,
      description: `${product.discountRate}% 할인 · ${formatCurrency(
        product.currentPrice,
      )}`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const data = await getProduct(id);
  if (!data?.product) notFound();

  const product = data.product;
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
