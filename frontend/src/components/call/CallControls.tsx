"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Settings,
  Hand,
  Circle,
  MoreVertical,
} from "lucide-react";
import { clsx } from "clsx";

// ===========================
// CallControls Component
// ===========================

interface CallControlsProps {
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  isChatOpen: boolean;
  isSignTrackingActive: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onToggleChat: () => void;
  onToggleSignTracking: () => void;
  onEndCall: () => void;
  onOpenSettings: () => void;
}

export function CallControls({
  isMuted,
  isVideoOn,
  isScreenSharing,
  isRecording,
  isChatOpen,
  isSignTrackingActive,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onToggleChat,
  onToggleSignTracking,
  onEndCall,
  onOpenSettings,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {/* Mic */}
      <ControlButton
        icon={isMuted ? MicOff : Mic}
        label={isMuted ? "Unmute" : "Mute"}
        onClick={onToggleMute}
        active={!isMuted}
        danger={isMuted}
      />

      {/* Camera */}
      <ControlButton
        icon={isVideoOn ? Video : VideoOff}
        label={isVideoOn ? "Turn off camera" : "Turn on camera"}
        onClick={onToggleVideo}
        active={isVideoOn}
        danger={!isVideoOn}
      />

      {/* Sign Language Tracking */}
      <ControlButton
        icon={Hand}
        label={isSignTrackingActive ? "Stop sign tracking" : "Start sign tracking"}
        onClick={onToggleSignTracking}
        active={isSignTrackingActive}
        highlight={isSignTrackingActive}
      />

      {/* Screen Share */}
      <ControlButton
        icon={isScreenSharing ? MonitorOff : Monitor}
        label={isScreenSharing ? "Stop sharing" : "Share screen"}
        onClick={onToggleScreenShare}
        active={isScreenSharing}
        highlight={isScreenSharing}
      />

      {/* Record */}
      <ControlButton
        icon={Circle}
        label={isRecording ? "Stop recording" : "Start recording"}
        onClick={onToggleRecording}
        active={isRecording}
        danger={isRecording}
      />

      {/* Chat */}
      <ControlButton
        icon={MessageSquare}
        label="Chat"
        onClick={onToggleChat}
        active={isChatOpen}
        highlight={isChatOpen}
      />

      {/* Settings */}
      <ControlButton
        icon={Settings}
        label="Settings"
        onClick={onOpenSettings}
        className="hidden sm:flex"
      />

      {/* End Call */}
      <button
        onClick={onEndCall}
        className="call-control call-control-danger w-14 sm:w-16"
        style={{ borderRadius: "2rem" }}
        aria-label="End call"
      >
        <PhoneOff size={20} />
      </button>
    </div>
  );
}

// --- Individual Control Button ---
function ControlButton({
  icon: Icon,
  label,
  onClick,
  active,
  danger,
  highlight,
  className,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "call-control",
        active && !danger && !highlight && "call-control-active",
        danger && "bg-red-500/20 border-red-500/30 text-red-400",
        highlight && "bg-[var(--color-primary-500)]/20 border-[var(--color-primary-500)]/30 text-[var(--color-primary-400)]",
        !active && !danger && !highlight && "text-white/70",
        className
      )}
      aria-label={label}
      title={label}
    >
      <Icon size={20} />
    </button>
  );
}
