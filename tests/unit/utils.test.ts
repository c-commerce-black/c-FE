import { describe, expect, it } from "vitest";

import {
  buildQueryString,
  formatCurrency,
  formatRemainTime,
  getNextSellerOrderStatus,
  getOrderStepIndex,
  getProductStatusTone,
  splitDuration,
} from "@/lib/utils";

describe("commerce utils", () => {
  it("formats currency in KRW", () => {
    expect(formatCurrency(12000)).toBe("₩12,000");
  });

  it("splits duration correctly", () => {
    expect(splitDuration(90061)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
  });

  it("formats remain time", () => {
    expect(formatRemainTime(3661)).toBe("01:01:01");
    expect(formatRemainTime(90061)).toBe("D-1 01:01:01");
  });

  it("maps status tone and step index", () => {
    expect(getProductStatusTone("EXPIRY_SOON")).toBe("urgent");
    expect(getOrderStepIndex("SHIPPING")).toBe(2);
    expect(getNextSellerOrderStatus("PENDING")).toBe("PREPARING");
    expect(getNextSellerOrderStatus("DELIVERED")).toBeNull();
  });

  it("builds query strings while skipping empty values", () => {
    expect(
      buildQueryString({
        category: "FOOD",
        sort: "expiry_asc",
        q: "",
      }),
    ).toBe("?category=FOOD&sort=expiry_asc");
  });
});
