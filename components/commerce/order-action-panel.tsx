"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getNextSellerOrderStatus } from "@/lib/utils";

export function OrderActionPanel({
  orderId,
  status,
  canCancel,
  canManageStatus,
}: {
  orderId: string;
  status: OrderStatus;
  canCancel: boolean;
  canManageStatus: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const nextSellerStatus = getNextSellerOrderStatus(status);

  function handleCancel() {
    startTransition(async () => {
      setFeedback(null);
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PATCH",
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setFeedback(payload.error?.message ?? "주문 취소에 실패했습니다.");
        return;
      }

      setFeedback(payload.data.message ?? "주문이 취소되었습니다.");
      router.refresh();
    });
  }

  function handleStatusUpdate() {
    if (!nextSellerStatus) return;

    startTransition(async () => {
      setFeedback(null);
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextSellerStatus }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setFeedback(payload.error?.message ?? "주문 상태 변경에 실패했습니다.");
        return;
      }

      setFeedback(
        `주문 상태가 ${ORDER_STATUS_LABELS[payload.data.order.status as OrderStatus]}로 변경되었습니다.`,
      );
      router.refresh();
    });
  }

  if (!canCancel && !(canManageStatus && nextSellerStatus)) {
    return null;
  }

  return (
    <Card className="space-y-4 p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-secondary">
          Order actions
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-foreground">
          주문 액션
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {canCancel ? (
          <Button
            variant="outline"
            size="lg"
            onClick={handleCancel}
            disabled={pending}
          >
            {pending ? "처리 중..." : "주문 취소"}
          </Button>
        ) : null}
        {canManageStatus && nextSellerStatus ? (
          <Button size="lg" onClick={handleStatusUpdate} disabled={pending}>
            {pending
              ? "처리 중..."
              : `${ORDER_STATUS_LABELS[nextSellerStatus]}로 변경`}
          </Button>
        ) : null}
      </div>
      {feedback ? <p className="text-sm text-text-secondary">{feedback}</p> : null}
    </Card>
  );
}
