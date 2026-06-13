"use client";

import React, { forwardRef } from "react";
import { clsx } from "clsx";

// ===========================
// Input Component
// ===========================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--foreground)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "input-field focus-ring",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-[var(--color-danger-500)] focus:border-[var(--color-danger-500)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--color-danger-500)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
