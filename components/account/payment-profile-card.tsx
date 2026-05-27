"use client";

import Link from "next/link";

import { usePaymentHistoryQuery, usePaymentProfileQuery } from "@/hooks/api";
import { formatCurrency, formatDate } from "@/lib/shared/utils";
import { Badge, Card } from "@/components/shared/ui";
import { EmptyState } from "@/components/shared/ui";

export function PaymentProfileCard() {
  const paymentProfileQuery = usePaymentProfileQuery();
  const paymentHistoryQuery = usePaymentHistoryQuery();

  return (
    <Card className="space-y-5 p-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-secondary">
          Payment
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-foreground">
          결제 지갑
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          결제 지갑은 계정마다 서버에서 자동 발급됩니다. 이 주소로 주문 결제와 판매 정산 내역을 조회할 수 있습니다.
        </p>
      </div>
      <div className="grid gap-3 rounded-[1.25rem] bg-surface-sunken p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
          Wallet balance
        </p>
        <div className="grid gap-3">
          <div>
            <p className="text-3xl font-black tracking-[-0.05em] text-brand-primary">
              {formatCurrency(paymentProfileQuery.data?.balance ?? 0)}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {paymentProfileQuery.data?.token ?? "USDC-test"}
            </p>
          </div>
          {paymentProfileQuery.data?.walletId ? (
            <div className="rounded-[1rem] border border-brand-secondary/15 bg-white/80 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                Active wallet
              </p>
              <p className="mt-2 break-all font-mono text-xs text-brand-secondary">
                {paymentProfileQuery.data.walletId}
              </p>
            </div>
          ) : (
            <Badge tone="warning">지갑 미등록</Badge>
          )}
        </div>
      </div>
      {paymentHistoryQuery.isLoading ? (
        <p className="text-sm text-text-secondary">결제 기록을 불러오는 중입니다.</p>
      ) : null}
      <div className="rounded-[1.25rem] border border-border bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
          Wallet address
        </p>
        <p className="mt-2 break-all font-mono text-sm text-foreground">
          {paymentProfileQuery.data?.walletId ?? "지갑을 준비 중입니다."}
        </p>
        {paymentProfileQuery.data?.updatedAt ? (
          <p className="mt-2 text-sm text-text-secondary">
            최근 동기화: {new Date(paymentProfileQuery.data.updatedAt).toLocaleString("ko-KR")}
          </p>
        ) : null}
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-black tracking-[-0.04em] text-foreground">
            등록된 wallet 결제 기록
          </h3>
          <Link href="/account" className="text-sm font-semibold text-brand-secondary">
            새로고침
          </Link>
        </div>
        {paymentHistoryQuery.data?.length ? (
          <div className="space-y-3">
            {paymentHistoryQuery.data.slice(0, 8).map((payment) => {
              const displayTimestamp = payment.paidAt ?? payment.updatedAt;

              return (
                <div
                  key={payment.id}
                  className="rounded-[1.25rem] border border-border bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {payment.direction === "OUT" ? "결제 보냄" : "정산 받음"}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        상대: {payment.counterparty || payment.sellerShopName}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        주문 #{payment.orderId.slice(0, 8)}
                        {displayTimestamp ? ` · ${formatDate(displayTimestamp)}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-base font-black ${
                          payment.direction === "OUT" ? "text-urgent" : "text-brand-secondary"
                        }`}
                      >
                        {payment.direction === "OUT" ? "-" : "+"}
                        {formatCurrency(payment.amount)}
                      </p>
                      <Badge tone={payment.status === "COMPLETED" ? "teal" : payment.status === "FAILED" ? "error" : "warning"}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                  {payment.errorMessage ? (
                    <p className="mt-2 text-xs text-urgent">{payment.errorMessage}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="결제 기록이 없습니다"
            description="주문 결제 또는 판매 정산이 생기면 이곳에 wallet 기준으로 표시됩니다."
          />
        )}
      </div>
    </Card>
  );
}
