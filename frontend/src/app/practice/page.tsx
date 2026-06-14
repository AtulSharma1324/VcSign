"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, Video } from "lucide-react";
import { clsx } from "clsx";
import { VideoPlayer } from "@/components/call/VideoPlayer";
import { useSignRecognition } from "@/hooks/useSignRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useCaptionStore } from "@/stores/captionStore";
import { Button } from "@/components/ui/Button";

export default function PracticeModePage() {
  const router = useRouter();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const { captions } = useCaptionStore();
  const { speak } = useTextToSpeech("practice-room", true);

  // Initialize camera
  useEffect(() => {
    let isMounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (isMounted) setLocalStream(stream);
      })
      .catch((err) => console.error("Camera access denied", err));

    return () => {
      isMounted = false;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Sign Tracking
  const { isLoaded } = useSignRecognition(videoEl, true, "practice-room");

  // Read captions out loud in Practice Mode
  useEffect(() => {
    const latestCaption = captions[captions.length - 1];
    // In practice mode, we WANT to hear our own captions
    if (latestCaption && latestCaption.callId === "practice-room") {
      const age = Date.now() - latestCaption.timestampMs;
      if (age < 1000) {
        speak(latestCaption.correctedText || latestCaption.rawText);
      }
    }
  }, [captions, speak]);

  const latestCaptionText = captions
    .filter((c) => c.callId === "practice-room")
    .pop()?.rawText || "Waiting for signs...";

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              Practice Mode
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {isLoaded ? "AI Active: Start signing!" : "Loading AI models..."}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 max-w-5xl w-full mx-auto flex flex-col gap-6">
          {/* Video Area */}
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-[var(--border)] shadow-2xl bg-black/50 aspect-video">
            <VideoPlayer
              ref={setVideoEl}
              stream={localStream}
              name="You (Practice)"
              isLocal
            />
            
            {/* Status Badge */}
            {isLoaded && (
              <div className="absolute top-3 left-3 md:top-4 md:left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.08)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Sign Tracking Live
                </span>
              </div>
            )}
          </div>

          {/* Translation Output Area */}
          <div className="bg-gradient-to-br from-[var(--surface-800)]/60 to-[var(--surface-900)]/80 border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-white/20">
            <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-[var(--color-primary-500)] to-[var(--color-secondary-500)] h-full" />
            <h3 className="text-[10px] md:text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-widest mb-1.5 md:mb-3 flex items-center gap-1.5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </div>
              <Mic size={12} className="text-[var(--color-primary-400)]" />
              Live Translation
            </h3>
            <div className={clsx(
              "text-2xl md:text-4xl font-bold font-[family-name:var(--font-display)] min-h-[1.5em] flex items-center leading-snug transition-all duration-300",
              latestCaptionText === "Waiting for signs..." ? "text-[var(--muted-foreground)]/40 italic font-normal text-lg md:text-2xl" : "text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-200"
            )}>
              {latestCaptionText}
            </div>
          </div>
      </div>
    </div>
  );
}
