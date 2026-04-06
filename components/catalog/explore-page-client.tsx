"use client";

import Link from "next/link";

import { Card, EmptyState, PageFallbackNotice } from "@/components/shared/ui";
import { useExploreFeedQuery } from "@/hooks/api";
import {
  CATEGORY_LABELS,
  createExploreFilters,
} from "@/lib/catalog";
import { PAGE_FALLBACK_MESSAGE } from "@/lib/shared/types";
import { buildQueryString } from "@/lib/shared/utils";
import { ExploreFeed } from "./explore-feed";
import { ExploreSortDropdown } from "./explore-sort-dropdown";

function ExploreFeedSkeleton({ index }: { index: number }) {
  return (
    <Card className="p-4" aria-hidden>
      <div className="flex gap-4">
        <div className="h-20 w-20 shrink-0 rounded-[16px] bg-surface-sunken" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 rounded-full bg-surface-sunken" />
          <div className="h-4 w-1/2 rounded-full bg-surface-sunken" />
          <div className="flex gap-2">
            <div className="h-7 w-14 rounded-full bg-surface-sunken" />
            <div className="h-7 w-16 rounded-full bg-surface-sunken" />
          </div>
        </div>
      </div>
      <span className="sr-only">탐색 상품 로딩 중 {index + 1}</span>
    </Card>
  );
}

export function ExplorePageClient({
  category,
  sort,
  q,
}: {
  category: string;
  sort: string;
  q: string;
}) {
  const filters = createExploreFilters({ category, sort, q });
  const exploreFeedQuery = useExploreFeedQuery(filters);
  const feedData = exploreFeedQuery.data;
  const hasQueryError = exploreFeedQuery.isError;

  return (
    <div className="cc-grid space-y-5 py-5">
      {hasQueryError ? <PageFallbackNotice message={PAGE_FALLBACK_MESSAGE} /> : null}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h1 className="text-[22px] font-black tracking-[-0.05em] text-foreground">
            카테고리
          </h1>
          <p className="text-[15px] text-text-secondary">총 {feedData?.total ?? 0}개</p>
        </div>
        <form
          className="flex w-full items-center gap-2 rounded-[16px] bg-surface-sunken p-2"
          action="/explore"
        >
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="sort" value={sort} />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="상품명 / 브랜드 검색"
            className="h-10 flex-1 rounded-[12px] bg-transparent px-3 text-[15px] outline-none placeholder:text-[#9ba6b8]"
          />
          <button className="h-10 rounded-[12px] bg-brand-primary px-4 text-[14px] font-semibold text-white">
            검색
          </button>
        </form>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Link
          href={`/explore${buildQueryString({ sort, q })}`}
          className={`rounded-full border px-4 py-2 text-[14px] font-semibold ${
            !category
              ? "border-brand-primary bg-brand-primary text-white"
              : "border-border bg-white text-text-secondary"
          }`}
        >
          전체
        </Link>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <Link
            key={value}
            href={`/explore${buildQueryString({ category: value, sort, q })}`}
            className={`rounded-full border px-4 py-2 text-[14px] font-semibold ${
              category === value
                ? "border-brand-primary bg-brand-primary text-white"
                : "border-border bg-white text-text-secondary"
            }`}
          >
            {label}
          </Link>
        ))}
      </section>

      <section className="relative">
        <ExploreSortDropdown category={category} sort={sort} q={q} />
      </section>

      <section className="space-y-3">
        {exploreFeedQuery.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <ExploreFeedSkeleton key={`explore-feed-skeleton-${index}`} index={index} />
            ))}
          </div>
        ) : feedData ? (
          <ExploreFeed
            initialItems={feedData.items}
            initialPage={1}
            initialHasMore={feedData.hasMore}
            total={feedData.total}
            filters={filters}
          />
        ) : (
          <EmptyState
            title="상품 목록을 불러오지 못했습니다"
            description="잠시 후 다시 확인해 주세요. 탐색 화면은 브라우저의 /api/products/feed 호출로 데이터를 다시 요청합니다."
            actionHref="/"
            actionLabel="홈으로 이동"
          />
        )}
      </section>
    </div>
  );
}
