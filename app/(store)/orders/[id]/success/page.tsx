import { OrderActionPanel } from "@/components/commerce/order-action-panel";
import Link from "next/link";

import { OrderStepper } from "@/components/commerce/order-stepper";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSessionToken, isSellerRole, requireUser } from "@/lib/auth";
import { getOrder } from "@/lib/commerce";
import { formatCurrency } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export default async function OrderSuccessPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const user = await requireUser(`/orders/${id}/success`);
  const token = await getSessionToken();
  const { order } = await getOrder(token as string, id);
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="cc-grid space-y-6 py-5">
      <section className="pt-6 text-center">
        <div className="mx-auto flex size-[84px] items-center justify-center rounded-full border-[3px] border-brand-primary bg-brand-primary-muted/40">
          <span className="text-[42px] font-black text-brand-primary">✓</span>
        </div>
        <h1 className="mt-4 text-[24px] font-black tracking-[-0.05em] text-foreground">
          {cancelled ? "주문 취소" : "주문 완료!"}
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          빠르게 준비해 드릴게요
        </p>
      </section>
      <Card className="space-y-4 p-4">
        <div>
          <p className="text-[12px] font-semibold text-[#9ca6b6]">주문 요약</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-bold text-[#586274]">
              {order.items[0]?.name ?? "주문 상품"}{order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}
            </p>
            <p className="mt-3 text-[16px] font-black text-foreground">최종 결제금액</p>
          </div>
          <p className="text-[20px] font-black tracking-[-0.04em] text-brand-primary">
            {formatCurrency(order.finalAmount)}
          </p>
        </div>
        <div className="flex gap-2">
          {order.items.slice(0, 2).map((item) => (
            <Badge key={item.productId} tone="error">
              D-{item.dDay ?? 0} 포함
            </Badge>
          ))}
        </div>
      </Card>
      <OrderStepper status={order.status} />
      <OrderActionPanel
        orderId={order.id}
        status={order.status}
        canCancel={false}
        canManageStatus={isSellerRole(user.role)}
      />
      <Link
        href="/"
        className="inline-flex h-[54px] items-center justify-center rounded-[16px] bg-brand-primary px-5 text-[16px] font-semibold text-white transition hover:bg-brand-primary-hover"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
