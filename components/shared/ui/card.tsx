"use client";

import * as React from "react";

import { cn } from "@/lib/shared/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-[#e8edf5] bg-surface shadow-[0_4px_14px_rgba(15,23,42,0.06)]",
        className,
      )}
      {...props}
    />
  );
}
