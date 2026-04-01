import Link from "next/link";

import { ExploreFeed } from "@/components/catalog";
import { ExploreSortDropdown } from "@/components/catalog";
import {
  CATEGORY_LABELS,
  createExploreFilters,
  EXPLORE_PAGE_SIZE,
} from "@/lib/catalog";
import { getProductFeedPage } from "@/lib/catalog/service";
import { buildQueryString } from "@/lib/shared/utils";

type SearchParams = Promise<{
  category?: string;
  sort?: string;
  q?: string;
}>;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category = "", sort = "expiry_asc", q = "" } = await searchParams;
  const filters = createExploreFilters({ category, sort, q });
  const data = await getProductFeedPage({
    page: 1,
    limit: EXPLORE_PAGE_SIZE,
    category,
    sort,
    q,
  });

  return (
    <div className="cc-grid space-y-5 py-5">
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h1 className="text-[22px] font-black tracking-[-0.05em] text-foreground">
            카테고리
          </h1>
          <p className="text-[15px] text-text-secondary">총 {data.total}개</p>
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
        <ExploreFeed
          initialItems={data.items}
          initialPage={1}
          initialHasMore={data.hasMore}
          total={data.total}
          filters={filters}
        />
      </section>
    </div>
  );
}
