"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCaptionStore } from "@/stores/captionStore";
import { CAPTION_SIZES } from "@/lib/constants";
import { clsx } from "clsx";

// ===========================
// CaptionOverlay Component
// ===========================

export function CaptionOverlay() {
  const { currentCaption, currentSpeaker, isVisible, settings } =
    useCaptionStore();
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (settings.autoHide && currentCaption) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => {
        useCaptionStore.getState().setCurrentCaption(null);
      }, settings.autoHideDelay);
    }
    return () => clearTimeout(hideTimeout.current);
  }, [currentCaption, settings.autoHide, settings.autoHideDelay]);

  if (!isVisible) return null;

  const positionClasses = {
    top: "top-4 left-1/2 -translate-x-1/2",
    bottom: "bottom-20 left-1/2 -translate-x-1/2",
    left: "left-4 top-1/2 -translate-y-1/2",
    right: "right-4 top-1/2 -translate-y-1/2",
  }[settings.position];

  return (
    <div className={clsx("absolute z-30 max-w-[80%] pointer-events-none", positionClasses)}>
      <AnimatePresence mode="wait">
        {currentCaption && (
          <motion.div
            key={currentCaption}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-black/85 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-2xl pointer-events-auto"
          >
            {settings.showSpeaker && currentSpeaker && (
              <p className="text-xs font-medium text-[var(--color-primary-400)] mb-1">
                {currentSpeaker}
              </p>
            )}
            <p
              className="text-white caption-text font-medium leading-relaxed"
              style={{
                fontSize: CAPTION_SIZES[settings.size],
                fontFamily: settings.font,
              }}
            >
              {currentCaption}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
