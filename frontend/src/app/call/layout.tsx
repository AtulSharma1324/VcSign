import React from "react";

export default function CallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--color-surface-950)]">
      {children}
    </div>
  );
}
