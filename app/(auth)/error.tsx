"use client";

import { RouteErrorPanel } from "@/components/shared/ui";

export default function AuthError({
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
      title="인증 화면 오류"
      description="잠시 후 다시 시도해 주세요."
      wrapperClassName="cc-shell flex min-h-screen items-center justify-center px-6"
      panelClassName="w-full max-w-lg"
    />
  );
}
