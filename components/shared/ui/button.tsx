"use client";

import * as React from "react";

import { cn } from "@/lib/shared/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-white shadow-none hover:bg-brand-primary-hover",
  secondary:
    "bg-brand-secondary text-white shadow-none hover:brightness-95",
  ghost: "bg-transparent text-foreground hover:bg-surface-sunken/80",
  outline:
    "border border-border bg-white text-foreground hover:border-brand-primary/40 hover:bg-brand-primary-muted/40",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-[54px] px-6 text-[16px]",
  icon: "size-[54px] p-0",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-[16px] font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
