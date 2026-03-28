"use client";

import { cn } from "@/lib/utils";

type BadgeTone = "pink" | "teal" | "cyan" | "warning" | "error" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  pink: "bg-brand-primary-muted text-brand-primary",
  teal: "bg-brand-secondary/10 text-brand-secondary",
  cyan: "bg-brand-accent/15 text-brand-secondary",
  warning: "bg-warning/10 text-warning",
  error: "bg-urgent/10 text-urgent",
  neutral: "bg-surface-sunken text-text-secondary",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[-0.01em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
