"use client";

import { useEffect } from "react";

import { cn } from "@/lib/shared/utils";

import { Button } from "./button";

type RouteErrorPanelProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
  description: string;
  eyebrow?: string;
  actionLabel?: string;
  wrapperClassName?: string;
  panelClassName?: string;
};

export function RouteErrorPanel({
  error,
  reset,
  title,
  description,
  eyebrow,
  actionLabel = "다시 시도",
  wrapperClassName,
  panelClassName,
}: RouteErrorPanelProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={wrapperClassName}>
      <div
        className={cn(
          "rounded-[2rem] border border-border bg-white p-10 shadow-[var(--cc-shadow-soft)]",
          panelClassName,
        )}
      >
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-foreground">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
        <Button className="mt-8" onClick={reset}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
