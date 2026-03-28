"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="cc-grid py-16">
      <div className="rounded-[2rem] border border-border bg-white p-10 shadow-[var(--cc-shadow-soft)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-primary">
          오류 발생
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-foreground">
          화면을 불러오지 못했습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          잠시 후 다시 시도해 주세요.
        </p>
        <Button className="mt-8" onClick={reset}>
          다시 시도
        </Button>
      </div>
    </div>
  );
}
