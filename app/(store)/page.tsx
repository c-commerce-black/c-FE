import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { HomeHero } from "@/components/catalog";
import { ProductCard } from "@/components/catalog";
import { Card } from "@/components/shared/ui";
import { CATEGORY_LABELS, getRemainSeconds } from "@/lib/catalog";
import { getProducts } from "@/lib/catalog/service";

export default async function HomePage() {
  const { products } = await getProducts({
    limit: 8,
    sort: "expiry_asc",
  });

  return (
    <div className="cc-grid space-y-6 py-0">
      <HomeHero
        key={products[0]?.id ?? "hero"}
        product={products[0] ?? null}
        initialSeconds={products[0] ? getRemainSeconds(products[0].expiryDate) : 0}
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
            className="items-center gap-2 text-sm font-semibold text-brand-primary inline-flex"
          >
            전체보기 <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} variant="home" />
          ))}
        </div>
      </section>

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
