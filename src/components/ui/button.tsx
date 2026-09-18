"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "gold" | "ghost" | "outline" | "subtle";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  gold: "bg-gold text-bg font-semibold hover:bg-gold-bright active:scale-[0.98] shadow-[0_1px_8px_rgba(0,0,0,0.12)]",
  ghost: "text-text-muted hover:text-text hover:bg-surface-2 active:scale-[0.98]",
  outline: "border border-border-strong text-text hover:bg-surface-2 active:scale-[0.98]",
  subtle: "bg-surface-2 text-text hover:bg-border-strong active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-sm rounded-[var(--radius-sm)]",
  md: "px-5 py-2.5 text-sm rounded-[var(--radius)]",
  lg: "px-7 py-3.5 text-base rounded-[var(--radius)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "gold", size = "md", loading = false, className = "", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading && (
          <span
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
