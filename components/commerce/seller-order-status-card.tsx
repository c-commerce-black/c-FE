"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage, requestApi } from "@/lib/api-error";
import { SELLER_ORDER_STATUS_OPTIONS } from "@/lib/constants";
import type { SellerOrderStatus } from "@/lib/types";

export function SellerOrderStatusCard() {
  const [pending, startTransition] = useTransition();
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<SellerOrderStatus>("PREPARING");
  const [feedback, setFeedback] = useState<string | null>(null);

  function submit() {
    if (!orderId.trim()) {
      setFeedback("주문 ID를 입력해 주세요.");
      return;
    }

    startTransition(async () => {
      setFeedback(null);
      const { ok, payload } = await requestApi(
        `/api/orders/${orderId.trim()}/status`,
        {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        },
        "주문 상태 변경에 실패했습니다.",
      );

      if (!ok || !payload.success) {
        setFeedback(getApiErrorMessage(payload, "주문 상태 변경에 실패했습니다."));
        return;
      }

      setFeedback(`주문 ${orderId.trim()} 상태가 변경되었습니다.`);
    });
  }

  return (
    <Card className="space-y-4 p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
          Seller orders
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-foreground">
          주문 상태 변경
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          주문 ID를 알고 있는 경우 문서에 정의된 상태 전이만 수행합니다.
        </p>
      </div>
      <Input
        label="주문 ID"
        placeholder="order123"
        value={orderId}
        onChange={(event) => setOrderId(event.target.value)}
      />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-foreground">
          변경할 상태
        </span>
        <select
          className="h-14 w-full rounded-[1.25rem] border border-border bg-white px-4 text-sm outline-none"
          value={status}
          onChange={(event) => setStatus(event.target.value as SellerOrderStatus)}
        >
          {SELLER_ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <Button size="lg" className="w-full" onClick={submit} disabled={pending}>
        {pending ? "변경 중..." : "주문 상태 변경"}
      </Button>
      {feedback ? <p className="text-sm text-text-secondary">{feedback}</p> : null}
    </Card>
  );
}
