"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { getApiErrorMessage, requestApi } from "@/lib/api-error";
import type { AlertItem } from "@/lib/types";
import { formatCurrency, formatRemainTime } from "@/lib/utils";

function AlertRow({
  item,
  onToggle,
}: {
  item: AlertItem;
  onToggle: (item: AlertItem) => void;
}) {
  const urgent = item.product.remainSeconds <= 86400;

  return (
    <Card className="relative overflow-hidden p-5">
      {item.isOn ? <span className="absolute inset-y-0 left-0 w-1 bg-brand-primary" /> : null}
      <div className="flex items-center justify-between gap-4">
        <Link href={`/products/${item.product.id}`} className="flex-1 space-y-1 pr-2">
          <p className="text-[16px] font-black tracking-[-0.04em] text-foreground">
            {item.product.name}
          </p>
          <p
            className={`text-[14px] font-semibold ${
              urgent ? "text-[#2ec26b]" : "text-[#8692a6]"
            } ${urgent && item.isOn ? "cc-blink" : ""}`}
          >
            마감까지 {formatRemainTime(item.product.remainSeconds)}
            {urgent ? " ⚡" : ""}
          </p>
          <p className="text-[14px] text-[#6a7487]">
            현재가 {formatCurrency(item.product.currentPrice)}
          </p>
        </Link>
        <div className="shrink-0">
          <Toggle checked={item.isOn} onCheckedChange={() => onToggle(item)} />
        </div>
      </div>
    </Card>
  );
}

export function AlertsClient({
  initialWishAlerts,
  initialTodayDeals,
}: {
  initialWishAlerts: AlertItem[];
  initialTodayDeals: AlertItem[];
}) {
  const [pending, startTransition] = useTransition();
  const [wishAlerts, setWishAlerts] = useState(initialWishAlerts);
  const [todayDeals, setTodayDeals] = useState(initialTodayDeals);
  const [feedback, setFeedback] = useState<string | null>(null);

  function updateCollections(nextItem: AlertItem) {
    setWishAlerts((current) =>
      current.map((item) =>
        item.product.id === nextItem.product.id ? nextItem : item,
      ),
    );
    setTodayDeals((current) =>
      current.map((item) =>
        item.product.id === nextItem.product.id ? nextItem : item,
      ),
    );
  }

  function handleToggle(item: AlertItem) {
    startTransition(async () => {
      setFeedback(null);

      if (!item.alertId) {
        const { ok, payload } = await requestApi<{ alert: { id: string; isOn: boolean } }>(
          "/api/alerts",
          {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.product.id }),
          },
          "찜 처리에 실패했습니다.",
        );
        if (!ok || !payload.success) {
          setFeedback(getApiErrorMessage(payload, "찜 처리에 실패했습니다."));
          return;
        }

        const nextItem = {
          ...item,
          alertId: payload.data.alert.id,
          isOn: payload.data.alert.isOn,
        };
        updateCollections(nextItem);
        setWishAlerts((current) => [nextItem, ...current]);
        return;
      }

      const { ok, payload } = await requestApi<{ alert: { isOn: boolean } }>(
        `/api/alerts/${item.alertId}/toggle`,
        {
          method: "PATCH",
        },
        "알림 토글에 실패했습니다.",
      );
      if (!ok || !payload.success) {
        setFeedback(getApiErrorMessage(payload, "알림 토글에 실패했습니다."));
        return;
      }

      updateCollections({
        ...item,
        isOn: payload.data.alert.isOn,
      });
    });
  }

  return (
    <div className="space-y-7">
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <p className="text-[13px] font-semibold text-[#9aa4b5]">찜한 상품</p>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="space-y-3">
          {wishAlerts.length ? (
            wishAlerts.map((item) => (
              <AlertRow
                key={item.alertId ?? item.product.id}
                item={item}
                onToggle={handleToggle}
              />
            ))
          ) : (
            <Card className="p-5 text-[13px] text-text-secondary">
              아직 찜한 상품이 없습니다. 상세 페이지에서 하트를 눌러 관심 상품을
              저장해 보세요.
            </Card>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <p className="text-[13px] font-semibold text-[#9aa4b5]">오늘 마감 특가</p>
          <span className="rounded-full bg-[#fff4dd] px-3 py-1 text-[12px] font-bold text-[#ffb11f]">
            HOT
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="space-y-3">
          {todayDeals.map((item) => (
            <AlertRow
              key={`${item.product.id}-${item.alertId ?? "today"}`}
              item={item}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </section>

      {feedback ? (
        <p className="text-[13px] text-text-secondary">{feedback}</p>
      ) : pending ? (
        <p className="text-[13px] text-text-secondary">변경 사항을 반영하는 중입니다.</p>
      ) : null}
    </div>
  );
}
