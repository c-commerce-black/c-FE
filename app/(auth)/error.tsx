"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AuthError({
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
    <div className="cc-shell flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-[2rem] border border-border bg-white p-10 shadow-[var(--cc-shadow-soft)]">
        <h1 className="text-3xl font-black tracking-[-0.05em] text-foreground">
          인증 화면 오류
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
