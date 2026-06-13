"use client";

import React from "react";
import { clsx } from "clsx";

// ===========================
// Avatar Component
// ===========================

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "away";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

const statusColors = {
  online: "bg-[var(--color-accent-500)]",
  offline: "bg-[var(--color-surface-400)]",
  busy: "bg-[var(--color-danger-500)]",
  away: "bg-[var(--color-warning-500)]",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, name, size = "md", status, className }: AvatarProps) {
  return (
    <div className={clsx("relative inline-flex shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={clsx(
            "rounded-full object-cover ring-2 ring-[var(--card)]",
            sizeMap[size]
          )}
        />
      ) : (
        <div
          className={clsx(
            "rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-[var(--card)]",
            sizeMap[size],
            getAvatarColor(name)
          )}
          aria-label={name}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-[var(--card)]",
            statusColors[status],
            size === "xs" || size === "sm" ? "w-2 h-2" : "w-3 h-3"
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}
