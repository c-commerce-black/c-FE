"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button, Card, EmptyState } from "@/components/shared/ui";
import { useDeleteSellerProductMutation } from "@/hooks/api";
import { STATUS_LABELS, type ProductStatus } from "@/lib/catalog";
import { getApiErrorMessage } from "@/lib/shared/api";
import type { SellerProductsData } from "@/lib/seller";
import { formatCurrency, formatDate } from "@/lib/shared/utils";

const STATUS_BADGE_CLASSES: Record<ProductStatus, string> = {
  ON_SALE: "bg-[#eefbf2] text-[#22c55e]",
  EXPIRY_SOON: "bg-[#fff1f5] text-brand-primary",
  SOLD_OUT: "bg-urgent/10 text-urgent",
  EXPIRED: "bg-surface-sunken text-text-secondary",
  DELETED: "bg-surface-sunken text-text-secondary",
};

export function SellerDashboardClient({
  initialData,
}: {
  initialData: SellerProductsData;
}) {
  const [products, setProducts] = useState(initialData.products);
  const [todaySales] = useState(initialData.todaySales);
  const [stats, setStats] = useState(initialData.stats);
  const [deleting, setDeleting] = useState<(typeof initialData.products)[number] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const deleteProductMutation = useDeleteSellerProductMutation();

  const statCards = useMemo(
    () => [
      ["판매중", stats.onSale],
      ["마감임박", stats.expirySoon],
      ["오늘주문", stats.todayOrders],
    ],
    [stats],
  );

  function submitDelete() {
    if (!deleting) return;

    setFeedback(null);
    void deleteProductMutation
      .mutateAsync({ id: deleting.id })
      .then(() => {
        setProducts((current) => current.filter((item) => item.id !== deleting.id));
        setStats((current) => ({
          ...current,
          onSale:
            deleting.status === "ON_SALE"
              ? Math.max(0, current.onSale - 1)
              : current.onSale,
          expirySoon:
            deleting.status === "EXPIRY_SOON"
              ? Math.max(0, current.expirySoon - 1)
              : current.expirySoon,
        }));
        setDeleting(null);
      })
      .catch((error) => {
        setFeedback(getApiErrorMessage(error, "상품 삭제에 실패했습니다."));
      });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-black tracking-[-0.05em] text-foreground">
              Seller Hub
            </h1>
            <p className="mt-2 flex items-center gap-2 text-[15px] font-semibold text-[#22c55e]">
              <span className="size-2 rounded-full bg-[#22c55e]" />
              오늘 매출 {formatCurrency(todaySales)}
            </p>
          </div>
          <Link
            href="/seller/products/new"
            className="inline-flex h-10 shrink-0 items-center rounded-[14px] bg-brand-primary px-4 text-[15px] font-semibold text-white"
          >
            + 등록
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {statCards.map(([label, value]) => (
          <Card key={label} className="p-4 text-center">
            <p
              className={`text-[18px] font-black tracking-[-0.04em] ${
                label === "판매중"
                  ? "text-[#22c55e]"
                  : label === "마감임박"
                    ? "text-brand-primary"
                    : "text-brand-secondary"
              }`}
            >
              {value}
            </p>
            <p className="mt-2 text-[13px] text-text-secondary">{label}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        {products.length ? (
          products.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[18px] font-black tracking-[-0.04em] text-foreground">
                        {product.name}
                      </h2>
                      {product.description ? (
                        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-text-secondary">
                          {product.description}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[13px] font-bold ${STATUS_BADGE_CLASSES[product.status]}`}
                    >
                      {STATUS_LABELS[product.status]}
                    </span>
                  </div>
                  <div className="mt-3 text-[14px] leading-6 text-text-secondary">
                    유통기한 {formatDate(product.expiryDate)} ·{" "}
                    {formatCurrency(product.currentPrice)} · 재고 {product.stock}개
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center gap-5 text-[15px] font-semibold">
                  <Link
                    href={`/seller/products/${product.id}/edit`}
                    className="text-brand-secondary"
                  >
                    수정
                  </Link>
                  <button
                    type="button"
                    className="text-[#ff5d5d]"
                    onClick={() => setDeleting(product)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState
            title="등록된 상품이 없습니다"
            description="새 상품을 등록하면 판매 현황과 재고를 여기서 바로 관리할 수 있어요."
            actionHref="/seller/products/new"
            actionLabel="상품 등록하기"
          />
        )}
      </section>

      {deleting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverted/40 px-4">
          <Card className="w-full max-w-[360px] p-5">
            <h3 className="text-[20px] font-black tracking-[-0.05em] text-foreground">
              정말 삭제할까요?
            </h3>
            <p className="mt-3 text-[14px] leading-6 text-text-secondary">
              {deleting.name} 상품은 소프트 삭제 처리되어 일반 상품 목록에서 사라집니다.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleting(null)}>
                취소
              </Button>
              <Button
                className="flex-1"
                onClick={submitDelete}
                disabled={deleteProductMutation.isPending}
              >
                삭제
              </Button>
            </div>
            {feedback ? <p className="mt-4 text-sm text-text-secondary">{feedback}</p> : null}
          </Card>
        </div>
      ) : null}

      {feedback && !deleting ? (
        <p className="text-sm text-text-secondary">{feedback}</p>
      ) : null}
    </div>
  );
}
