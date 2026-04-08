import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-chartjs-2", () => ({
  Line: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="price-history-line-chart">{data.labels.join(",")}</div>
  ),
}));

import { PriceHistoryChart } from "@/components/catalog";

describe("PriceHistoryChart", () => {
  it("renders a descending price summary with the corrected direction", () => {
    render(
      <PriceHistoryChart
        points={[
          { dDay: 1, price: 8900 },
          { dDay: 7, price: 11900 },
          { dDay: 3, price: 9900 },
        ]}
        currentPrice={8900}
        currentDDay={1}
        originalPrice={12900}
      />,
    );

    expect(screen.getByText("가격 변동 추이")).toBeVisible();
    expect(screen.getByTestId("price-history-line-chart")).toHaveTextContent(
      "D-7,D-3,D-1",
    );
    expect(screen.getByText(/현재 D-1 · ₩8,900/)).toBeVisible();
    expect(screen.getByText(/시작 D-7 · ₩11,900 ↑ 34%/)).toBeVisible();
  });

  it("keeps the chart visible and hides only the summary when the data conflicts", () => {
    render(
      <PriceHistoryChart
        points={[
          { dDay: 591, price: 8000 },
          { dDay: 3, price: 8000 },
        ]}
        currentPrice={4750}
        currentDDay={591}
        originalPrice={5000}
      />,
    );

    expect(screen.getByTestId("price-history-line-chart")).toHaveTextContent(
      "D-591,D-3",
    );
    expect(screen.getByText("가격 변동 데이터를 확인 중입니다.")).toBeVisible();
    expect(screen.queryByText(/현재 D-591 · ₩4,750/)).not.toBeInTheDocument();
  });

  it("keeps the empty state when no valid history remains", () => {
    render(
      <PriceHistoryChart
        points={[
          { dDay: -1, price: 1000 },
          { dDay: 3, price: 0 },
        ]}
      />,
    );

    expect(screen.getByText("아직 가격 변동 이력이 없습니다.")).toBeVisible();
  });
});
