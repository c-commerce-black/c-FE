import { OrderActionPanel } from "@/components/orders";
import Link from "next/link";

import { OrderStepper } from "@/components/orders";
import { Badge } from "@/components/shared/ui";
import { Card } from "@/components/shared/ui";
import { PageFallbackNotice } from "@/components/shared/ui";
import { getSessionToken, requireUser } from "@/lib/auth/server";
import { ORDER_PAYMENT_STATUS_LABELS } from "@/lib/orders";
import { getOrder } from "@/lib/orders/service";
import { createPageLoadState, type PageLoadState } from "@/lib/shared/types";
import { formatCurrency } from "@/lib/shared/utils";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ payment?: string }>;

async function getOrderPageData(token: string, id: string): Promise<{
  order: Awaited<ReturnType<typeof getOrder>>["order"] | null;
  loadState: PageLoadState;
}> {
  try {
    const { order } = await getOrder(token, id);
    return {
      order,
      loadState: createPageLoadState(),
    };
  } catch {
    return {
      order: null,
      loadState: createPageLoadState(true),
    };
  }
}

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  await requireUser(`/orders/${id}/success`);
  const token = await getSessionToken();
  const { order, loadState } = await getOrderPageData(token as string, id);
  if (!order) {
    return (
      <div className="cc-grid space-y-6 py-5">
        <section className="pt-6 text-center">
          <div className="mx-auto flex size-[84px] items-center justify-center rounded-full border-[3px] border-brand-primary bg-brand-primary-muted/40">
            <span className="text-[42px] font-black text-brand-primary">!</span>
          </div>
          <h1 className="mt-4 text-[24px] font-black tracking-[-0.05em] text-foreground">
            주문 정보를 확인 중입니다
          </h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            주문 상세를 불러오지 못해 요약 정보만 표시하고 있어요.
          </p>
        </section>
        {loadState.isFallback && loadState.message ? (
          <PageFallbackNotice message={loadState.message} />
        ) : null}
        <Card className="space-y-4 p-5">
          <p className="text-[16px] font-black tracking-[-0.04em] text-foreground">
            주문 정보를 불러오지 못했습니다
          </p>
          <p className="text-[14px] leading-6 text-text-secondary">
            잠시 후 다시 확인하거나 홈에서 다른 상품을 둘러보세요.
          </p>
          <div className="flex gap-2">
            <Link
              href="/account"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-[16px] border border-border bg-white px-5 text-[15px] font-semibold text-foreground transition hover:bg-surface-sunken"
            >
              내 정보 보기
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-[16px] bg-brand-primary px-5 text-[15px] font-semibold text-white transition hover:bg-brand-primary-hover"
            >
              홈으로 이동
            </Link>
          </div>
        </Card>
      </div>
    );
  }
  const cancelled = order.status === "CANCELLED";
  const paymentFailed = resolvedSearchParams.payment === "failed";
  const canPay =
    order.status !== "CANCELLED" && order.paymentStatus !== "PAID" && order.paymentStatus !== "PARTIAL";
  const canCancel =
    order.status === "PENDING" &&
    order.paymentStatus !== "PAID" &&
    order.paymentStatus !== "PARTIAL";

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
      {paymentFailed || order.paymentStatus !== "PAID" ? (
        <Card className="space-y-2 border border-urgent/20 bg-urgent/5 p-4">
          <p className="text-[15px] font-bold text-foreground">
            {paymentFailed ? "주문은 생성됐지만 결제가 완료되지 않았습니다." : "결제 상태를 확인해 주세요."}
          </p>
          <p className="text-[14px] leading-6 text-text-secondary">
            현재 상태는 {ORDER_PAYMENT_STATUS_LABELS[order.paymentStatus]}입니다. 계정 페이지에서 지갑 정보를 수정하거나 아래에서 다시 결제할 수 있습니다.
          </p>
        </Card>
      ) : null}
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
          <Badge tone={order.paymentStatus === "PAID" ? "teal" : "error"}>
            {ORDER_PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </Badge>
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
        paymentStatus={order.paymentStatus}
        canCancel={canCancel}
        canPay={canPay}
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
