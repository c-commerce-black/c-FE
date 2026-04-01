"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { ProductCard } from "@/components/catalog";
import { EmptyState } from "@/components/shared/ui";
import { Card } from "@/components/shared/ui";
import { getApiErrorMessage } from "@/lib/shared/api";
import {
  createExploreFilters,
  type ExploreFilters,
  type Product,
} from "@/lib/catalog";
import { useExploreFeedPageMutation } from "@/hooks/api";
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
  const loadMoreMutation = useExploreFeedPageMutation();

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
  const isEmpty = visibleItems.length === 0 && !currentLoading && !currentError;

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
      const data = await loadMoreMutation.mutateAsync({
        page: currentPage + 1,
        filters: filtersRef.current,
      });

      appendFeed({
        items: data.items,
        page: data.nextPage ? data.nextPage - 1 : currentPage + 1,
        hasMore: data.hasMore,
        total: data.total,
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "상품을 더 불러오지 못했습니다."));
    }
  }, [
    appendFeed,
    currentLoading,
    currentPage,
    hydrated,
    setError,
    setLoading,
    visibleHasMore,
    loadMoreMutation,
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
      {isEmpty ? (
        <div className="flex min-h-[44vh] items-center justify-center">
          <div className="w-full max-w-md">
            <EmptyState
              title="표시할 상품이 아직 없어요"
              description="선택한 조건에 맞는 상품을 찾지 못했습니다. 카테고리나 검색어를 바꿔 다시 확인해 주세요."
            />
          </div>
        </div>
      ) : (
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
      )}

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
