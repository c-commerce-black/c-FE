import * as React from "react";

import { cn } from "@/lib/shared/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string | null;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, ...props }, ref) => (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-sm font-semibold text-foreground">
          {label}
        </span>
      ) : null}
      <textarea
        ref={ref}
        className={cn(
          "min-h-32 w-full rounded-[1.25rem] border border-border bg-surface-sunken px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-text-tertiary focus:border-brand-secondary focus:bg-white",
          error && "border-urgent/60 focus:border-urgent",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="mt-2 block text-xs text-urgent">{error}</span>
      ) : hint ? (
        <span className="mt-2 block text-xs text-text-secondary">{hint}</span>
      ) : null}
    </label>
  ),
);

Textarea.displayName = "Textarea";
