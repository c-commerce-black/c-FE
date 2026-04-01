import { describe, expect, it } from "vitest";

import {
  createPageLoadState,
  PAGE_FALLBACK_MESSAGE,
} from "@/lib/shared/types";

describe("page load state", () => {
  it("returns a clean state by default", () => {
    expect(createPageLoadState()).toEqual({ isFallback: false });
  });

  it("returns the shared fallback message for fallback states", () => {
    expect(createPageLoadState(true)).toEqual({
      isFallback: true,
      message: PAGE_FALLBACK_MESSAGE,
    });
  });
});
