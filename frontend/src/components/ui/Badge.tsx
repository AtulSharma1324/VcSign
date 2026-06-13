"use client";

import React from "react";
import { clsx } from "clsx";

// ===========================
// Badge Component
// ===========================

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "danger" | "warning" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "primary",
  size = "md",
  dot = false,
  className,
}: BadgeProps) {
  const variantClasses = {
    primary: "badge-primary",
    success: "badge-success",
    danger: "badge-danger",
    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    neutral:
      "bg-[var(--muted)] text-[var(--muted-foreground)]",
  }[variant];

  const dotColors = {
    primary: "bg-[var(--color-primary-500)]",
    success: "bg-[var(--color-accent-500)]",
    danger: "bg-[var(--color-danger-500)]",
    warning: "bg-[var(--color-warning-500)]",
    neutral: "bg-[var(--color-surface-400)]",
  }[variant];

  return (
    <span
      className={clsx(
        "badge",
        variantClasses,
        size === "sm" && "text-[11px] px-2 py-0",
        className
      )}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full mr-1.5", dotColors)}
        />
      )}
      {children}
    </span>
  );
}
