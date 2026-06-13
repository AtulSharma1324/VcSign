"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, Video } from "lucide-react";
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
      <header className="flex items-center justify-between mb-8">
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

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto grid grid-rows-[1fr_auto] gap-6">
        {/* Video Area */}
        <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] shadow-2xl bg-black/50 aspect-video">
          <VideoPlayer
            ref={setVideoEl}
            stream={localStream}
            name="You (Practice)"
            isLocal
          />
          
          {/* Status Badge */}
          {isLoaded && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-primary-500)]/20 border border-[var(--color-primary-500)]/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary-400)] animate-pulse" />
              <span className="text-xs font-bold text-[var(--color-primary-400)] uppercase tracking-wider">
                Sign Tracking Live
              </span>
            </div>
          )}
        </div>

        {/* Translation Output Area */}
        <div className="bg-[var(--surface-800)] border border-[var(--border)] rounded-2xl p-6 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-[var(--color-primary-500)] to-[var(--color-secondary-500)] h-full" />
          <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-widest mb-2 flex items-center gap-2">
            <Mic size={14} />
            Live Translation
          </h3>
          <div className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-display)] text-[var(--foreground)] min-h-[1.5em] flex items-center">
            {latestCaptionText}
          </div>
        </div>
      </div>
    </div>
  );
}
