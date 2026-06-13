"use client";

import React from "react";
import { clsx } from "clsx";

// ===========================
// Card Component
// ===========================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  hoverable = false,
  padding = "md",
  className,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  }[padding];

  return (
    <div
      className={clsx(
        "card",
        hoverable && "card-hover cursor-pointer",
        paddingClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
