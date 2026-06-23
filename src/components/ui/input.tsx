"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={[
            "w-full bg-surface-2 border text-text placeholder-text-subtle rounded-[var(--radius)] px-4 py-3 text-sm transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/40",
            error
              ? "border-red-500/60 focus:ring-red-500/30 focus:border-red-500/60"
              : "border-border-strong hover:border-border-strong",
            className,
          ].join(" ")}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
