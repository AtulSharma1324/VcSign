"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { clsx } from "clsx";
import { MicOff, VideoOff } from "lucide-react";

// ===========================
// VideoPlayer Component
// ===========================

interface VideoPlayerProps {
  stream: MediaStream | null;
  name: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isLocal?: boolean;
  className?: string;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({
  stream,
  name,
  isMuted = false,
  isVideoOff = false,
  isLocal = false,
  className,
}, ref) => {
  const localRef = useRef<HTMLVideoElement>(null);

  // Combine forwarded ref and local ref
  useImperativeHandle(ref, () => localRef.current as HTMLVideoElement);

  useEffect(() => {
    if (localRef.current && stream) {
      localRef.current.srcObject = stream;
    }
  }, [stream]);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={clsx(
        "relative rounded-2xl overflow-hidden bg-[var(--color-surface-800)] group",
        className
      )}
    >
      {/* Video element */}
      {stream && !isVideoOff ? (
        <video
          ref={localRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        /* Avatar fallback when video is off */
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-surface-700)] to-[var(--color-surface-800)]">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {initials}
          </div>
        </div>
      )}

      {/* Name overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium truncate">
            {name}
            {isLocal && " (You)"}
          </span>
          <div className="flex items-center gap-1.5">
            {isMuted && (
              <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                <MicOff size={12} className="text-white" />
              </div>
            )}
            {isVideoOff && (
              <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                <VideoOff size={12} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Always-visible mute indicator */}
      {isMuted && (
        <div className="absolute top-3 right-3">
          <div className="w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center shadow-md">
            <MicOff size={14} className="text-white" />
          </div>
        </div>
      )}

      {/* Live indicator for local */}
      {isLocal && stream && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-white font-medium">LIVE</span>
        </div>
      )}
    </div>
  );
});
