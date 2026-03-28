"use client";

import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onCheckedChange,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-[50px] shrink-0 rounded-full transition",
        checked ? "bg-brand-secondary" : "bg-[#e9edf3]",
        className,
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "absolute top-1 size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.16)] transition",
          checked ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}
