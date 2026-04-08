import type { PricePoint } from "@/lib/catalog";

export type PriceHistoryTrend = "up" | "down" | "flat";

export type PreparedPriceHistoryChart = {
  points: PricePoint[];
  labels: string[];
  prices: number[];
  firstPoint: PricePoint | null;
  lastPoint: PricePoint | null;
  currentPoint: PricePoint | null;
  currentIndex: number;
  canRenderChart: boolean;
  isValid: boolean;
  trend: PriceHistoryTrend;
  changeAmount: number;
  changeRate: number;
};

function isValidPoint(point: PricePoint) {
  return point.price > 0 && point.dDay >= 0;
}

export function preparePriceHistoryChart(
  input: PricePoint[],
  currentPoint?: PricePoint | null,
  originalPrice?: number,
): PreparedPriceHistoryChart {
  const points = [...input]
    .filter(isValidPoint)
    .filter((point) => point.dDay !== currentPoint?.dDay);

  if (currentPoint && isValidPoint(currentPoint)) {
    points.push(currentPoint);
  }

  points.sort((left, right) => right.dDay - left.dDay);

  const firstPoint = points[0] ?? null;
  const lastPoint = points.at(-1) ?? null;
  const resolvedCurrentPoint =
    (currentPoint && isValidPoint(currentPoint) ? currentPoint : null) ??
    lastPoint;
  const currentIndex = resolvedCurrentPoint
    ? points.findIndex((point) => point.dDay === resolvedCurrentPoint.dDay)
    : -1;
  const comparisonPoint =
    points.length <= 1
      ? resolvedCurrentPoint
      : currentIndex === 0
        ? lastPoint
        : firstPoint;
  const changeAmount =
    resolvedCurrentPoint && comparisonPoint
      ? comparisonPoint.price - resolvedCurrentPoint.price
      : 0;
  const trend: PriceHistoryTrend =
    changeAmount < 0 ? "down" : changeAmount > 0 ? "up" : "flat";
  const changeRate =
    resolvedCurrentPoint && resolvedCurrentPoint.price > 0
      ? Math.round((Math.abs(changeAmount) / resolvedCurrentPoint.price) * 100)
      : 0;
  const exceedsOriginalPrice =
    typeof originalPrice === "number" && originalPrice > 0
      ? points.some((point) => point.price > originalPrice)
      : false;
  const breaksDescendingPriceRule = points.some((point, index) => {
    const nextPoint = points[index + 1];
    if (!nextPoint) return false;
    return nextPoint.price > point.price;
  });
  const isValid =
    points.length >= 2 &&
    currentIndex >= 0 &&
    !exceedsOriginalPrice &&
    !breaksDescendingPriceRule;
  const canRenderChart = points.length >= 2;

  return {
    points,
    labels: points.map((point) => `D-${point.dDay}`),
    prices: points.map((point) => point.price),
    firstPoint,
    lastPoint,
    currentPoint: resolvedCurrentPoint,
    currentIndex,
    canRenderChart,
    isValid,
    trend,
    changeAmount,
    changeRate,
  };
}
