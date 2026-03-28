import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string | null;
  rightSlot?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, rightSlot, ...props }, ref) => (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-sm font-semibold text-foreground">
          {label}
        </span>
      ) : null}
      <span
        className={cn(
          "flex h-[54px] items-center gap-3 rounded-[14px] border border-border bg-surface-sunken px-4 transition focus-within:border-brand-secondary focus-within:bg-white",
          error && "border-urgent/60 focus-within:border-urgent",
        )}
      >
        <input
          ref={ref}
          className={cn(
            "w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-[#a2acbc]",
            className,
          )}
          {...props}
        />
        {rightSlot}
      </span>
      {error ? (
        <span className="mt-2 block text-xs text-urgent">{error}</span>
      ) : hint ? (
        <span className="mt-2 block text-xs text-text-secondary">{hint}</span>
      ) : null}
    </label>
  ),
);

Input.displayName = "Input";
