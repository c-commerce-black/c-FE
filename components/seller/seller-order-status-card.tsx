"use client";

import { useState } from "react";

import { Button } from "@/components/shared/ui";
import { Card } from "@/components/shared/ui";
import { Input } from "@/components/shared/ui";
import { getApiErrorMessage } from "@/lib/shared/api";
import { useUpdateOrderStatusMutation } from "@/hooks/api";
import { SELLER_ORDER_STATUS_OPTIONS } from "@/lib/seller";
import type { SellerOrderStatus } from "@/lib/orders";

export function SellerOrderStatusCard() {
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<SellerOrderStatus>("PREPARING");
  const [feedback, setFeedback] = useState<string | null>(null);

  function submit() {
    if (!orderId.trim()) {
      setFeedback("주문 ID를 입력해 주세요.");
      return;
    }

    setFeedback(null);
    void updateOrderStatusMutation
      .mutateAsync({ orderId: orderId.trim(), status })
      .then(() => {
        setFeedback(`주문 ${orderId.trim()} 상태가 변경되었습니다.`);
      })
      .catch((error) => {
        setFeedback(getApiErrorMessage(error, "주문 상태 변경에 실패했습니다."));
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
      <Button
        size="lg"
        className="w-full"
        onClick={submit}
        disabled={updateOrderStatusMutation.isPending}
      >
        {updateOrderStatusMutation.isPending ? "변경 중..." : "주문 상태 변경"}
      </Button>
      {feedback ? <p className="text-sm text-text-secondary">{feedback}</p> : null}
    </Card>
  );
}
