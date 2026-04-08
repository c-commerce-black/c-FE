import { describe, expect, it } from "vitest";

import { preparePriceHistoryChart } from "@/components/catalog/price-history-chart.helpers";

describe("preparePriceHistoryChart", () => {
  it("sorts price history from older points to current points", () => {
    const result = preparePriceHistoryChart([
      { dDay: 1, price: 8900 },
      { dDay: 7, price: 11900 },
      { dDay: 3, price: 9900 },
    ], undefined, 12900);

    expect(result.labels).toEqual(["D-7", "D-3", "D-1"]);
    expect(result.prices).toEqual([11900, 9900, 8900]);
    expect(result.canRenderChart).toBe(true);
    expect(result.isValid).toBe(true);
  });

  it("compares the current point against the earliest point", () => {
    const result = preparePriceHistoryChart([
      { dDay: 7, price: 10000 },
      { dDay: 1, price: 8000 },
    ], { dDay: 1, price: 8000 }, 12000);

    expect(result.trend).toBe("up");
    expect(result.changeAmount).toBe(2000);
    expect(result.changeRate).toBe(25);
    expect(result.isValid).toBe(true);
  });

  it("marks ascending prices as up", () => {
    const result = preparePriceHistoryChart([
      { dDay: 5, price: 5000 },
      { dDay: 1, price: 6500 },
    ], { dDay: 5, price: 5000 }, 7000);

    expect(result.trend).toBe("up");
    expect(result.changeAmount).toBe(1500);
    expect(result.changeRate).toBe(30);
    expect(result.isValid).toBe(false);
  });

  it("marks identical prices as flat", () => {
    const result = preparePriceHistoryChart([
      { dDay: 5, price: 5000 },
      { dDay: 1, price: 5000 },
    ], { dDay: 5, price: 5000 }, 5000);

    expect(result.trend).toBe("flat");
    expect(result.changeAmount).toBe(0);
    expect(result.changeRate).toBe(0);
    expect(result.canRenderChart).toBe(true);
    expect(result.isValid).toBe(true);
  });

  it("replaces the matching d-day with the explicit current point", () => {
    const result = preparePriceHistoryChart(
      [
        { dDay: 591, price: 8000 },
        { dDay: 3, price: 8000 },
      ],
      { dDay: 591, price: 4750 },
      5000,
    );

    expect(result.currentPoint).toEqual({ dDay: 591, price: 4750 });
    expect(result.labels).toEqual(["D-591", "D-3"]);
    expect(result.prices).toEqual([4750, 8000]);
    expect(result.canRenderChart).toBe(true);
    expect(result.isValid).toBe(false);
  });

  it("marks price history invalid when any point exceeds the original price", () => {
    const result = preparePriceHistoryChart(
      [
        { dDay: 10, price: 4000 },
        { dDay: 5, price: 5200 },
      ],
      { dDay: 1, price: 3500 },
      5000,
    );

    expect(result.isValid).toBe(false);
  });

  it("filters invalid points and returns an empty state model when none remain", () => {
    const result = preparePriceHistoryChart([
      { dDay: -1, price: 1000 },
      { dDay: 2, price: 0 },
    ]);

    expect(result.points).toEqual([]);
    expect(result.firstPoint).toBeNull();
    expect(result.lastPoint).toBeNull();
    expect(result.trend).toBe("flat");
    expect(result.canRenderChart).toBe(false);
    expect(result.isValid).toBe(false);
  });
});
