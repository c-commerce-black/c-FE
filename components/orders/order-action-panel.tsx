"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/shared/ui";
import { Card } from "@/components/shared/ui";
import { getApiErrorMessage } from "@/lib/shared/api";
import { useCancelOrderMutation, useUpdateOrderStatusMutation } from "@/hooks/api";
import type { OrderStatus } from "@/lib/orders";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import { getNextSellerOrderStatus } from "@/lib/orders";

export function OrderActionPanel({
  orderId,
  status,
  canCancel,
  canUpdateStatus = false,
}: {
  orderId: string;
  status: OrderStatus;
  canCancel: boolean;
  canUpdateStatus?: boolean;
}) {
  const router = useRouter();
  const cancelOrderMutation = useCancelOrderMutation();
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const [feedback, setFeedback] = useState<string | null>(null);

  const nextSellerStatus = canUpdateStatus ? getNextSellerOrderStatus(status) : null;

  function handleCancel() {
    setFeedback(null);
    void cancelOrderMutation
      .mutateAsync({ orderId })
      .then((data) => {
        setFeedback(data.message ?? "주문이 취소되었습니다.");
        router.refresh();
      })
      .catch((error) => {
        setFeedback(getApiErrorMessage(error, "주문 취소에 실패했습니다."));
      });
  }

  function handleStatusUpdate() {
    if (!nextSellerStatus) return;

    setFeedback(null);
    void updateOrderStatusMutation
      .mutateAsync({ orderId, status: nextSellerStatus })
      .then((data) => {
        setFeedback(
          `주문 상태가 ${ORDER_STATUS_LABELS[data.order.status as OrderStatus]}로 변경되었습니다.`,
        );
        router.refresh();
      })
      .catch((error) => {
        setFeedback(getApiErrorMessage(error, "주문 상태 변경에 실패했습니다."));
      });
  }

  if (!canCancel && !nextSellerStatus) {
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
            disabled={cancelOrderMutation.isPending || updateOrderStatusMutation.isPending}
          >
            {cancelOrderMutation.isPending ? "처리 중..." : "주문 취소"}
          </Button>
        ) : null}
        {nextSellerStatus ? (
          <Button
            size="lg"
            onClick={handleStatusUpdate}
            disabled={cancelOrderMutation.isPending || updateOrderStatusMutation.isPending}
          >
            {updateOrderStatusMutation.isPending
              ? "처리 중..."
              : `${ORDER_STATUS_LABELS[nextSellerStatus]}로 변경`}
          </Button>
        ) : null}
      </div>
      {feedback ? <p className="text-sm text-text-secondary">{feedback}</p> : null}
    </Card>
  );
}
