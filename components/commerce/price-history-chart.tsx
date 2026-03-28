import { formatCurrency } from "@/lib/utils";
import type { PricePoint } from "@/lib/types";

function buildPath(points: PricePoint[]) {
  if (points.length === 0) return "";
  const max = Math.max(...points.map((point) => point.price));
  const min = Math.min(...points.map((point) => point.price));
  const range = Math.max(max - min, 1);

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - ((point.price - min) / range) * 70 - 10;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function PriceHistoryChart({ points }: { points: PricePoint[] }) {
  if (!points.length) {
    return (
      <div className="rounded-[16px] border border-border bg-white px-6 py-10 text-center text-sm text-text-secondary">
        아직 가격 변동 이력이 없습니다.
      </div>
    );
  }

  const linePath = buildPath(points);
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;
  const last = points[points.length - 1];
  const first = points[0];
  const delta = first.price > 0 ? Math.round(((first.price - last.price) / first.price) * 100) : 0;

  return (
    <div className="space-y-3">
      <h3 className="text-[16px] font-bold tracking-[-0.03em] text-foreground">
        가격 변동 추이
      </h3>
      <div className="rounded-[16px] border border-border bg-white px-4 py-4">
        <svg viewBox="0 0 100 100" className="h-[120px] w-full overflow-visible">
        <defs>
          <linearGradient id="price-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,105,180,0.28)" />
            <stop offset="100%" stopColor="rgba(255,105,180,0.03)" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#price-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#ff69b4"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((point, index) => {
          const max = Math.max(...points.map((entry) => entry.price));
          const min = Math.min(...points.map((entry) => entry.price));
          const range = Math.max(max - min, 1);
          const x = (index / Math.max(points.length - 1, 1)) * 100;
          const y = 100 - ((point.price - min) / range) * 70 - 10;
          return (
            <g key={`${point.dDay}-${point.price}`}>
              <circle
                cx={x}
                cy={y}
                r={index === points.length - 1 ? 2.8 : 2}
                fill={index === points.length - 1 ? "#069494" : "#ffffff"}
                stroke="#ff69b4"
                strokeWidth={1.8}
              />
              <text
                x={x}
                y={98}
                textAnchor="middle"
                fontSize="5"
                fill="#667085"
              >
                D-{point.dDay}
              </text>
            </g>
          );
        })}
        </svg>
        <div className="mt-1 flex items-center justify-between text-[11px]">
          <span className="text-text-tertiary">
            2주 전 {formatCurrency(first.price)}
          </span>
          <span className="font-bold text-brand-primary">
            현재 {formatCurrency(last.price)} ↓ {delta}%
          </span>
        </div>
      </div>
    </div>
  );
}
