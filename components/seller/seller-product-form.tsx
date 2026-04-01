"use client";

import { useMemo, useState, useTransition } from "react";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/shared/ui";
import { Card } from "@/components/shared/ui";
import { Input } from "@/components/shared/ui";
import { Textarea } from "@/components/shared/ui";
import { getApiErrorMessage, requestApi } from "@/lib/shared/api";
import { CATEGORY_LABELS } from "@/lib/catalog";

const categoryOptions = Object.entries(CATEGORY_LABELS);

function formatPreviewPrice(value: string, label: string) {
  const base = Number(value || 18000);
  const discount = label === "D-5" ? 0.95 : label === "D-3" ? 0.8 : 0.5;
  return `${Math.round(base * discount).toLocaleString("ko-KR")}원`;
}

export function SellerProductForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [values, setValues] = useState({
    name: "",
    category: "FOOD",
    originalPrice: "",
    stock: "",
    expiryDate: "",
    description: "",
    imageUrl: "",
  });

  const steps = useMemo(
    () => [
      { label: "D-5", discount: "-5%", width: "34%", color: "bg-warning" },
      { label: "D-3", discount: "-20%", width: "58%", color: "bg-warning" },
      { label: "D-1", discount: "-50%", width: "84%", color: "bg-brand-primary" },
    ],
    [],
  );

  function updateField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      setError(null);
      const { ok, payload } = await requestApi("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          category: values.category,
          originalPrice: Number(values.originalPrice),
          stock: Number(values.stock),
          expiryDate: values.expiryDate,
          description: values.description,
          imageUrl: values.imageUrl || undefined,
        }),
      }, "상품 등록에 실패했습니다.");
      if (!ok || !payload.success) {
        setError(getApiErrorMessage(payload, "상품 등록에 실패했습니다."));
        return;
      }
      router.push("/seller");
      router.refresh();
    });
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <section className="space-y-4">
        <Input
          label="상품명"
          placeholder="상품명"
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-foreground">카테고리</span>
          <select
            className="h-[54px] w-full rounded-[14px] border border-border bg-surface-sunken px-4 text-[15px] font-semibold outline-none focus:border-brand-secondary focus:bg-white"
            value={values.category}
            onChange={(event) => updateField("category", event.target.value)}
          >
            {categoryOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="정가"
            type="number"
            placeholder="18,000원"
            value={values.originalPrice}
            onChange={(event) => updateField("originalPrice", event.target.value)}
          />
          <Input
            label="재고"
            type="number"
            placeholder="120개"
            value={values.stock}
            onChange={(event) => updateField("stock", event.target.value)}
          />
        </div>
        <Input
          label="유통기한"
          type="date"
          value={values.expiryDate}
          onChange={(event) => updateField("expiryDate", event.target.value)}
          className="border-brand-secondary bg-white"
        />
        <Textarea
          label="상품 설명"
          placeholder="상품 상태, 보관 방법, 유통기한 특이사항 등을 적어 주세요."
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          hint="상세 페이지와 주문 화면에 함께 노출됩니다."
        />

        <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-border-strong bg-white px-6 text-center">
          {filePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={filePreview}
              alt="선택한 이미지 미리보기"
              className="h-40 w-full rounded-[14px] object-cover"
            />
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-[14px] bg-[#eef7ff] text-[#68b4f0]">
                <Camera className="size-6" />
              </div>
              <p className="mt-4 text-[18px] font-black tracking-[-0.04em] text-foreground">
                이미지 업로드
              </p>
              <p className="mt-1 text-[13px] text-text-secondary">
                JPG, PNG · 최대 10MB
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setFilePreview(URL.createObjectURL(file));
            }}
          />
          <span className="mt-3 text-[12px] text-text-secondary">
            업로드 API 연동 전까지는 미리보기만 지원됩니다.
          </span>
        </label>
      </section>

      <section className="space-y-4">
        <Card className="p-4">
          <p className="text-[14px] font-semibold text-[#a3aebe]">자동 할인 스케줄</p>
          <div className="mt-4 space-y-5">
            {steps.map((step) => (
              <div key={step.label}>
                <div className="flex items-center justify-between text-[15px] font-semibold">
                  <span>
                    {step.label} · {formatPreviewPrice(values.originalPrice, step.label)}
                  </span>
                  <span className={step.label === "D-1" ? "text-brand-primary" : "text-warning"}>
                    {step.discount}
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-surface-sunken">
                  <div className={`h-1.5 rounded-full ${step.color}`} style={{ width: step.width }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        {error ? <p className="text-sm text-urgent">{error}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "등록 중..." : "등록하기"}
        </Button>
      </section>
    </form>
  );
}
