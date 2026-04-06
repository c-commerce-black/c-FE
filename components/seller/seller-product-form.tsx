"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button, Card, Input, Textarea } from "@/components/shared/ui";
import { useCreateSellerProductMutation, useImageUploadMutation, useUpdateSellerProductMutation } from "@/hooks/api";
import { CATEGORY_LABELS } from "@/lib/catalog";
import { getApiErrorMessage } from "@/lib/shared/api";

const categoryOptions = Object.entries(CATEGORY_LABELS);

export type SellerProductFormValues = {
  name: string;
  description: string;
  category: string;
  originalPrice: string;
  stock: string;
  expiryDate: string;
  imageUrl: string;
};

function formatPreviewPrice(value: string, label: string) {
  const base = Number(value || 18000);
  const discount = label === "D-5" ? 0.95 : label === "D-3" ? 0.8 : 0.5;
  return `${Math.round(base * discount).toLocaleString("ko-KR")}원`;
}

export function SellerProductForm({
  mode = "create",
  productId,
  initialValues,
}: {
  mode?: "create" | "edit";
  productId?: string;
  initialValues?: Partial<SellerProductFormValues>;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createProductMutation = useCreateSellerProductMutation();
  const updateProductMutation = useUpdateSellerProductMutation();
  const imageUploadMutation = useImageUploadMutation();
  const [error, setError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(
    initialValues?.imageUrl || null,
  );
  const [values, setValues] = useState<SellerProductFormValues>({
    name: initialValues?.name ?? "",
    category: initialValues?.category ?? "FOOD",
    originalPrice: initialValues?.originalPrice ?? "",
    stock: initialValues?.stock ?? "",
    expiryDate: initialValues?.expiryDate ?? "",
    description: initialValues?.description ?? "",
    imageUrl: initialValues?.imageUrl ?? "",
  });

  const steps = useMemo(
    () => [
      { label: "D-5", discount: "-5%", width: "34%", color: "bg-warning" },
      { label: "D-3", discount: "-20%", width: "58%", color: "bg-warning" },
      { label: "D-1", discount: "-50%", width: "84%", color: "bg-brand-primary" },
    ],
    [],
  );

  const submitting = createProductMutation.isPending || updateProductMutation.isPending;
  const uploading = imageUploadMutation.isPending;

  function updateField(field: keyof SellerProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      name: values.name,
      description: values.description,
      category: values.category,
      originalPrice: Number(values.originalPrice),
      stock: Number(values.stock),
      expiryDate: values.expiryDate,
      imageUrl: values.imageUrl || undefined,
    };

    const request =
      mode === "edit" && productId
        ? updateProductMutation.mutateAsync({
            id: productId,
            ...payload,
          })
        : createProductMutation.mutateAsync(payload);

    void request
      .then(() => {
        router.push("/seller");
        router.refresh();
      })
      .catch((requestError) => {
        setError(
          getApiErrorMessage(
            requestError,
            mode === "edit" ? "상품 수정에 실패했습니다." : "상품 등록에 실패했습니다.",
          ),
        );
      });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setFilePreview(URL.createObjectURL(file));

    void imageUploadMutation
      .mutateAsync({ file })
      .then(({ imageUrl }) => {
        updateField("imageUrl", imageUrl);
      })
      .catch((uploadError) => {
        setError(getApiErrorMessage(uploadError, "이미지 업로드에 실패했습니다."));
      });
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <section className="space-y-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-brand-secondary">
            {mode === "edit" ? "Edit product" : "New product"}
          </p>
          <h1 className="mt-2 text-[24px] font-black tracking-[-0.05em] text-foreground">
            {mode === "edit" ? "상품 수정" : "상품 등록"}
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-text-secondary">
            스웨거 명세에 맞는 상품 정보를 입력하면 셀러 목록과 구매자 화면에 바로 반영됩니다.
          </p>
        </div>

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
            placeholder="18000"
            value={values.originalPrice}
            onChange={(event) => updateField("originalPrice", event.target.value)}
          />
          <Input
            label="재고"
            type="number"
            placeholder="120"
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

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-foreground">상품 이미지</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-border-strong bg-white px-6 text-center"
          >
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
            <span className="mt-3 inline-flex items-center gap-2 text-[12px] text-text-secondary">
              {uploading ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
              {uploading
                ? "업로드 중..."
                : values.imageUrl
                  ? "업로드가 완료되었습니다. 이미지를 다시 누르면 교체됩니다."
                  : "선택 즉시 업로드됩니다."}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
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
        <div className="flex gap-3">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={submitting || uploading}
          >
            {submitting
              ? mode === "edit"
                ? "수정 중..."
                : "등록 중..."
              : mode === "edit"
                ? "수정 저장"
                : "등록하기"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/seller")}
            disabled={submitting}
          >
            취소
          </Button>
        </div>
      </section>
    </form>
  );
}
