"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { ProductCard } from "@/components/catalog";
import { Card } from "@/components/shared/ui";
import { getApiErrorMessage, requestApi } from "@/lib/shared/api";
import {
  createExploreFilters,
  EXPLORE_PAGE_SIZE,
  type ExploreFilters,
  type Product,
} from "@/lib/catalog";
import { useExploreFeedStore } from "@/stores/explore-feed-store";

function sameFilters(left: ExploreFilters, right: ExploreFilters) {
  return left.category === right.category && left.sort === right.sort && left.q === right.q;
}

function FeedSkeleton() {
  return (
    <Card className="p-4">
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
    </Card>
  );
}

export function ExploreFeed({
  initialItems,
  initialPage,
  initialHasMore,
  total,
  filters,
}: {
  initialItems: Product[];
  initialPage: number;
  initialHasMore: boolean;
  total: number;
  filters: ExploreFilters;
}) {
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const restoredRef = useRef(false);
  const filtersRef = useRef(filters);

  const store = useExploreFeedStore();
  const {
    items,
    page,
    hasMore,
    isLoading,
    error,
    scrollY,
    initialized,
    hydrateFeed,
    appendFeed,
    setLoading,
    setError,
    setScrollY,
    resetFeed,
  } = store;
  const storedFilters = store.filters;

  const normalizedFilters = useMemo(() => createExploreFilters(filters), [filters]);
  const usesStoredFeed = hydrated && initialized && sameFilters(storedFilters, normalizedFilters);
  const visibleItems = usesStoredFeed ? items : initialItems;
  const visibleHasMore = usesStoredFeed ? hasMore : initialHasMore;
  const currentPage = usesStoredFeed ? page : initialPage;
  const currentError = hydrated ? error : null;
  const currentLoading = hydrated ? isLoading : false;

  useEffect(() => {
    filtersRef.current = normalizedFilters;
  }, [normalizedFilters]);

  useEffect(() => {
    if (!hydrated) return;

    if (!initialized) {
      hydrateFeed({
        filters: normalizedFilters,
        items: initialItems,
        page: initialPage,
        hasMore: initialHasMore,
        total,
      });
      restoredRef.current = true;
      return;
    }

    if (!sameFilters(storedFilters, normalizedFilters)) {
      resetFeed(normalizedFilters);
      hydrateFeed({
        filters: normalizedFilters,
        items: initialItems,
        page: initialPage,
        hasMore: initialHasMore,
        total,
      });
      restoredRef.current = true;
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (!restoredRef.current) {
      restoredRef.current = true;
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, behavior: "auto" });
      });
    }
  }, [
    hydrated,
    hydrateFeed,
    initialHasMore,
    initialItems,
    initialPage,
    initialized,
    normalizedFilters,
    resetFeed,
    scrollY,
    storedFilters,
    total,
  ]);

  useEffect(() => {
    if (!hydrated || !usesStoredFeed) return;

    let frame = 0;
    const handleScroll = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hydrated, setScrollY, usesStoredFeed]);

  const loadMore = useCallback(async () => {
    if (!hydrated || currentLoading || !visibleHasMore) return;

    setLoading(true);
    setError(null);

    try {
      const search = new URLSearchParams({
        page: String(currentPage + 1),
        limit: String(EXPLORE_PAGE_SIZE),
        sort: filtersRef.current.sort,
      });

      if (filtersRef.current.category) search.set("category", filtersRef.current.category);
      if (filtersRef.current.q) search.set("q", filtersRef.current.q);

      const { ok, payload } = await requestApi<{ items: Product[]; nextPage: number | null; hasMore: boolean; total: number }>(
        `/api/products/feed?${search.toString()}`,
        {
          cache: "no-store",
        },
        "상품을 더 불러오지 못했습니다.",
      );

      if (!ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, "상품을 더 불러오지 못했습니다."));
      }

      appendFeed({
        items: payload.data.items,
        page: payload.data.nextPage ? payload.data.nextPage - 1 : currentPage + 1,
        hasMore: payload.data.hasMore,
        total: payload.data.total,
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "상품을 더 불러오지 못했습니다.",
      );
    }
  }, [
    appendFeed,
    currentLoading,
    currentPage,
    hydrated,
    setError,
    setLoading,
    visibleHasMore,
  ]);

  useEffect(() => {
    if (!hydrated || !visibleHasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hydrated, loadMore, visibleHasMore]);

  return (
    <section className="space-y-3">
      <div className="space-y-3">
        {visibleItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {currentLoading
          ? Array.from({ length: 2 }).map((_, index) => (
              <FeedSkeleton key={`skeleton-${index}`} />
            ))
          : null}
      </div>

      {currentError ? (
        <Card className="border-warning/30 bg-warning/5 p-4">
          <p className="text-[13px] font-semibold text-foreground">{currentError}</p>
          <button
            type="button"
            onClick={() => void loadMore()}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-[12px] bg-inverted px-4 text-[13px] font-semibold text-white"
          >
            다시 시도
          </button>
        </Card>
      ) : null}

      {!visibleHasMore && visibleItems.length > 0 ? (
        <p className="px-1 pb-2 text-center text-[13px] text-text-secondary">
          총 {total}개 상품을 모두 불러왔습니다.
        </p>
      ) : null}

      <div ref={sentinelRef} aria-hidden className="h-6" />
    </section>
  );
}
