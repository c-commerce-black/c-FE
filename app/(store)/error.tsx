"use client";

import { RouteErrorPanel } from "@/components/shared/ui";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorPanel
      error={error}
      reset={reset}
      eyebrow="오류 발생"
      title="화면을 불러오지 못했습니다"
      description="잠시 후 다시 시도해 주세요."
      wrapperClassName="cc-grid py-16"
    />
  );
}
