"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SellerProduct, SellerProductsData } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type EditableSellerProduct = SellerProduct & {
  originalPrice?: number;
};

export function SellerDashboardClient({
  initialData,
}: {
  initialData: SellerProductsData;
}) {
  const [pending, startTransition] = useTransition();
  const [products, setProducts] = useState<EditableSellerProduct[]>(
    initialData.products,
  );
  const [todaySales] = useState(initialData.todaySales);
  const [stats, setStats] = useState(initialData.stats);
  const [editing, setEditing] = useState<EditableSellerProduct | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<EditableSellerProduct | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const statCards = useMemo(
    () => [
      ["판매중", stats.onSale],
      ["마감임박", stats.expirySoon],
      ["오늘주문", stats.todayOrders],
    ],
    [stats],
  );

  function beginEdit(product: EditableSellerProduct) {
    setEditing(product);
    setDraft({
      name: product.name,
      originalPrice: String(product.originalPrice ?? product.currentPrice),
      stock: String(product.stock),
      expiryDate: product.expiryDate.slice(0, 10),
    });
  }

  function submitEdit() {
    if (!editing) return;
    startTransition(async () => {
      setFeedback(null);
      const response = await fetch(`/api/seller/products/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          originalPrice: Number(draft.originalPrice),
          stock: Number(draft.stock),
          expiryDate: draft.expiryDate,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setFeedback(payload.error?.message ?? "상품 수정에 실패했습니다.");
        return;
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === editing.id
            ? {
                ...product,
                name: payload.data.product.name ?? draft.name,
                currentPrice:
                  payload.data.product.currentPrice ?? Number(draft.originalPrice),
                stock: payload.data.product.stock ?? Number(draft.stock),
                expiryDate: payload.data.product.expiryDate ?? draft.expiryDate,
              }
            : product,
        ),
      );
      setEditing(null);
      setDraft({});
    });
  }

  function submitDelete() {
    if (!deleting) return;
    startTransition(async () => {
      setFeedback(null);
      const response = await fetch(`/api/seller/products/${deleting.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setFeedback(payload.error?.message ?? "상품 삭제에 실패했습니다.");
        return;
      }

      setProducts((current) => current.filter((item) => item.id !== deleting.id));
      setStats((current) => ({
        ...current,
        onSale: Math.max(0, current.onSale - 1),
      }));
      setDeleting(null);
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
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[18px] font-black tracking-[-0.04em] text-foreground">
                    {product.name}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-[13px] font-bold ${
                      product.status === "EXPIRY_SOON"
                        ? "bg-[#fff1f5] text-brand-primary"
                        : "bg-[#eefbf2] text-[#22c55e]"
                    }`}
                  >
                    {product.status === "EXPIRY_SOON" ? "마감임박" : "판매중"}
                  </span>
                </div>
                <div className="mt-3 text-[14px] leading-6 text-text-secondary">
                  유통기한 {formatDate(product.expiryDate)} ·{" "}
                  {formatCurrency(product.currentPrice)} · 재고 {product.stock}개
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center gap-5 text-[15px] font-semibold">
                <button
                  type="button"
                  className="text-brand-secondary"
                  onClick={() => beginEdit(product)}
                >
                  수정
                </button>
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
        ))}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-inverted/40 px-4 py-6">
          <Card className="w-full max-w-[396px] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[20px] font-black tracking-[-0.05em] text-foreground">
                  상품 수정
                </h3>
              </div>
              <button type="button" onClick={() => setEditing(null)}>
                <X className="size-5 text-text-tertiary" />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <Input
                label="상품명"
                value={draft.name ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
              />
              <Input
                label="가격"
                type="number"
                value={draft.originalPrice ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    originalPrice: event.target.value,
                  }))
                }
              />
              <Input
                label="재고"
                type="number"
                value={draft.stock ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, stock: event.target.value }))
                }
              />
              <Input
                label="유통기한"
                type="date"
                value={draft.expiryDate ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    expiryDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="mt-6 flex gap-3">
              <Button className="flex-1" onClick={submitEdit} disabled={pending}>
                저장하기
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                취소
              </Button>
            </div>
            {feedback ? <p className="mt-4 text-sm text-text-secondary">{feedback}</p> : null}
          </Card>
        </div>
      ) : null}

      {deleting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverted/40 px-4">
          <Card className="w-full max-w-[360px] p-5">
            <h3 className="text-[20px] font-black tracking-[-0.05em] text-foreground">
              정말 삭제할까요?
            </h3>
            <p className="mt-3 text-[14px] leading-6 text-text-secondary">
              {deleting.name} 상품은 소프트 삭제 처리되어 일반 상품 목록에서
              사라집니다.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleting(null)}>
                취소
              </Button>
              <Button className="flex-1" onClick={submitDelete} disabled={pending}>
                삭제
              </Button>
            </div>
            {feedback ? <p className="mt-4 text-sm text-text-secondary">{feedback}</p> : null}
          </Card>
        </div>
      ) : null}

      {feedback && !editing && !deleting ? (
        <p className="text-sm text-text-secondary">{feedback}</p>
      ) : null}
    </div>
  );
}
