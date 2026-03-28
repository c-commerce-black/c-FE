import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from "@/lib/constants";

export function OrderStepper({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-[18px] border border-urgent/20 bg-white p-4 shadow-[var(--cc-shadow-card)]">
        <p className="text-[12px] font-semibold text-[#9aa4b5]">배송 상태</p>
        <p className="mt-3 text-[20px] font-black tracking-[-0.05em] text-foreground">
          주문이 취소되었습니다
        </p>
        <p className="mt-2 text-[14px] leading-6 text-text-secondary">
          취소된 주문은 더 이상 배송 단계가 진행되지 않습니다.
        </p>
      </div>
    );
  }

  const activeIndex = Math.max(ORDER_STATUS_STEPS.indexOf(status as never), 0);

  return (
    <div className="rounded-[18px] border border-border bg-white p-4 shadow-[var(--cc-shadow-card)]">
      <p className="text-[12px] font-semibold text-[#9aa4b5]">배송 상태</p>
      <div className="mt-5 flex items-start justify-between">
        {ORDER_STATUS_STEPS.map((step, index) => {
          const active = index <= activeIndex;
          const current = index === activeIndex;
          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    "inline-flex size-4 rounded-full border-2",
                    current
                      ? "border-brand-primary bg-[#ffd8eb]"
                      : active
                        ? "border-brand-primary bg-brand-primary"
                        : "border-border bg-white",
                  )}
                />
                <span
                  className={cn(
                    "text-center text-[12px] font-semibold",
                    current
                      ? "text-brand-primary"
                      : active
                        ? "text-[#738095]"
                        : "text-[#b3bcc9]",
                  )}
                >
                  {ORDER_STATUS_LABELS[step]}
                </span>
              </div>
              {index < ORDER_STATUS_STEPS.length - 1 ? (
                <span
                  className={cn(
                    "mt-[-18px] h-px flex-1",
                    index < activeIndex ? "bg-brand-primary" : "bg-border",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
