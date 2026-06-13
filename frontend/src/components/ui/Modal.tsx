"use client";

import React, { useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// ===========================
// Modal Component
// ===========================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showClose = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={clsx(
              "relative w-full card p-6",
              sizeClasses
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {showClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            )}

            {title && (
              <div className="mb-4">
                <h2
                  id="modal-title"
                  className="text-lg font-semibold font-[family-name:var(--font-display)]"
                >
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {description}
                  </p>
                )}
              </div>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
