"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

import type { PricePoint } from "@/lib/catalog";
import { formatCurrency } from "@/lib/shared/utils";

import { preparePriceHistoryChart } from "./price-history-chart.helpers";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
);

export function PriceHistoryChart({
  points,
  currentPrice,
  currentDDay,
  originalPrice,
}: {
  points: PricePoint[];
  currentPrice?: number;
  currentDDay?: number;
  originalPrice?: number;
}) {
  const prepared = preparePriceHistoryChart(
    points,
    currentPrice && typeof currentDDay === "number"
      ? {
          dDay: currentDDay,
          price: currentPrice,
        }
      : null,
    originalPrice,
  );

  if (!prepared.points.length || !prepared.currentPoint || !prepared.canRenderChart) {
    return (
      <div className="rounded-[16px] border border-border bg-white px-6 py-10 text-center text-sm text-text-secondary">
        아직 가격 변동 이력이 없습니다.
      </div>
    );
  }

  const pointBackgroundColor = prepared.points.map((_, index) =>
    index === prepared.currentIndex ? "#0f9f9f" : "#ffffff",
  );
  const pointBorderColor = prepared.points.map(() => "#ff5ca8");
  const pointRadius = prepared.points.map((_, index) =>
    index === prepared.currentIndex ? 5 : 4,
  );
  const pointHoverRadius = prepared.points.map((_, index) =>
    index === prepared.currentIndex ? 6 : 5,
  );

  const data: ChartData<"line"> = {
    labels: prepared.labels,
    datasets: [
      {
        data: prepared.prices,
        borderColor: "#ff5ca8",
        backgroundColor: "rgba(255, 92, 168, 0.08)",
        borderWidth: 3,
        tension: 0.2,
        fill: false,
        pointBackgroundColor,
        pointBorderColor,
        pointBorderWidth: 2,
        pointRadius,
        pointHoverRadius,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        backgroundColor: "#101828",
        callbacks: {
          title: (items) => items[0]?.label ?? "",
          label: (context) => formatCurrency(Number(context.parsed.y ?? 0)),
        },
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          color: "rgba(148, 163, 184, 0.18)",
          drawTicks: false,
        },
        ticks: {
          color: "#7c8aa5",
          font: {
            size: 11,
            weight: 600,
          },
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          color: "rgba(148, 163, 184, 0.18)",
          drawTicks: false,
        },
        ticks: {
          display: false,
        },
      },
    },
  };

  const summaryTone =
    prepared.trend === "up"
      ? "text-[#ff8a00]"
      : prepared.trend === "down"
        ? "text-brand-primary"
        : "text-text-secondary";
  const comparisonPoint =
    prepared.points.length <= 1
      ? prepared.currentPoint
      : prepared.currentIndex === 0
        ? prepared.lastPoint
        : prepared.firstPoint;
  const comparisonLabel =
    prepared.currentIndex === 0 ? "마감" : "시작";
  const summaryText =
    prepared.trend === "flat"
      ? "변동 없음"
      : `${prepared.trend === "down" ? "↓" : "↑"} ${prepared.changeRate}%`;

  return (
    <div className="space-y-3">
      <h3 className="text-[16px] font-bold tracking-[-0.03em] text-foreground">
        가격 변동 추이
      </h3>
      <div className="rounded-[20px] border border-border bg-white px-4 py-4">
        <div className="h-[220px]">
          <Line data={data} options={options} />
        </div>
        {prepared.isValid ? (
          <div className="mt-3 flex items-center justify-between gap-3 text-[12px]">
            <span className="text-text-tertiary">
              현재 D-{prepared.currentPoint.dDay} · {formatCurrency(prepared.currentPoint.price)}
            </span>
            <span className={`font-bold ${summaryTone}`}>
              {comparisonPoint && comparisonPoint.dDay !== prepared.currentPoint.dDay
                ? `${comparisonLabel} D-${comparisonPoint.dDay} · ${formatCurrency(comparisonPoint.price)} ${summaryText}`
                : `현재 ${formatCurrency(prepared.currentPoint.price)} ${summaryText}`}
            </span>
          </div>
        ) : (
          <p className="mt-3 text-center text-[12px] text-text-secondary">
            가격 변동 데이터를 확인 중입니다.
          </p>
        )}
      </div>
    </div>
  );
}
