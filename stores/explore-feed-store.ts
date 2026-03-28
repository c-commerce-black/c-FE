"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ExploreFeedState, ExploreFilters, Product } from "@/lib/types";

type ExploreFeedStore = ExploreFeedState & {
  hydrateFeed: (payload: {
    filters: ExploreFilters;
    items: Product[];
    page: number;
    hasMore: boolean;
    total: number;
  }) => void;
  appendFeed: (payload: {
    items: Product[];
    page: number;
    hasMore: boolean;
    total: number;
  }) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setScrollY: (scrollY: number) => void;
  resetFeed: (filters: ExploreFilters) => void;
};

const defaultFilters: ExploreFilters = {
  category: "",
  sort: "expiry_asc",
  q: "",
};

export const useExploreFeedStore = create<ExploreFeedStore>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      items: [],
      page: 1,
      hasMore: false,
      isLoading: false,
      error: null,
      scrollY: 0,
      total: 0,
      initialized: false,
      hydrateFeed: ({ filters, items, page, hasMore, total }) =>
        set({
          filters,
          items,
          page,
          hasMore,
          total,
          initialized: true,
          isLoading: false,
          error: null,
          scrollY: 0,
        }),
      appendFeed: ({ items, page, hasMore, total }) =>
        set((state) => ({
          items: [...state.items, ...items],
          page,
          hasMore,
          total,
          initialized: true,
          isLoading: false,
          error: null,
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      setScrollY: (scrollY) => set({ scrollY }),
      resetFeed: (filters) =>
        set({
          filters,
          items: [],
          page: 1,
          hasMore: false,
          total: 0,
          isLoading: false,
          error: null,
          scrollY: 0,
          initialized: false,
        }),
    }),
    {
      name: "cc-explore-feed",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        filters: state.filters,
        items: state.items,
        page: state.page,
        hasMore: state.hasMore,
        scrollY: state.scrollY,
        total: state.total,
        initialized: state.initialized,
      }),
    },
  ),
);
