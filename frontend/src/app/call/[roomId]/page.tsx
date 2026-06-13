"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { toast } from "sonner";

import { VideoPlayer } from "@/components/call/VideoPlayer";
import { CallControls } from "@/components/call/CallControls";
import { CaptionOverlay } from "@/components/captions/CaptionOverlay";
import { ChatPanel } from "@/components/call/ChatPanel";
import { useCallStore } from "@/stores/callStore";
import { useAuthStore } from "@/stores/authStore";
import { useCaptionStore } from "@/stores/captionStore";
import { getSocket, connectSocket } from "@/lib/socket";
import { WebRTCManager } from "@/lib/webrtc";
import { MEDIA_CONSTRAINTS } from "@/lib/constants";
import { useSignRecognition } from "@/hooks/useSignRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

// ===========================
// Video Call Room Page
// ===========================

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  type: "text" | "emoji" | "system";
  createdAt: string;
}

export default function CallRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const user = useAuthStore((s) => s.user);
  const {
    localStream,
    isMuted,
    isVideoOn,
    isScreenSharing,
    isRecording,
    peers,
    callStartTime,
    setCallActive,
    setLocalStream,
    addPeer,
    removePeer,
    updatePeerStream,
    updatePeerMedia,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    toggleRecording,
    endCall,
  } = useCallStore();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSignTracking, setIsSignTracking] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [elapsed, setElapsed] = useState("00:00");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  // --- Initialize AI Hooks ---
  const { isLoaded: isSignLoaded } = useSignRecognition(videoEl, isSignTracking, roomId);
  const { speak } = useTextToSpeech(roomId, true);
  
  // Track speech when not muted
  useSpeechRecognition(!isMuted, roomId);

  const webrtcRef = useRef<WebRTCManager | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // --- Timer ---
  useEffect(() => {
    if (callStartTime) {
      timerRef.current = setInterval(() => {
        const diff = Math.floor((Date.now() - callStartTime) / 1000);
        const mins = Math.floor(diff / 60)
          .toString()
          .padStart(2, "0");
        const secs = (diff % 60).toString().padStart(2, "0");
        setElapsed(`${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callStartTime]);

  // --- Initialize call ---
  useEffect(() => {
    if (!user || !roomId) return;

    let isMounted = true;

    async function initCall() {
      try {
        // Get local media
        const stream = await navigator.mediaDevices.getUserMedia(
          MEDIA_CONSTRAINTS
        );
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setLocalStream(stream);

        // Create WebRTC manager
        const manager = new WebRTCManager();
        manager.setLocalStream(stream);
        webrtcRef.current = manager;

        // Connect Socket.IO
        connectSocket();
        const socket = getSocket();

        // Join room
        socket.emit("room:join", { roomId, userId: user!.id });

        // Handle participants already in the room
        socket.on("room:joined", ({ participants }) => {
          participants.forEach((p) => {
            if (p.userId !== user!.id) {
              addPeer({
                userId: p.userId,
                displayName: p.displayName,
                avatarUrl: p.avatarUrl,
                isMuted: false,
                isVideoOn: true,
                stream: null,
              });

              // Create offer for each existing participant
              const pc = manager.createPeerConnection({
                userId: p.userId,
                onTrack: (stream, uid) => updatePeerStream(uid, stream),
                onIceCandidate: (candidate, uid) => {
                  socket.emit("signal:ice-candidate", {
                    candidate: candidate.toJSON(),
                    targetUserId: uid,
                    roomId,
                  });
                },
                onConnectionStateChange: (state, uid) => {
                  if (state === "disconnected" || state === "failed") {
                    console.warn(`[WebRTC] Peer ${uid} ${state}`);
                  }
                },
              });

              manager
                .createOffer(p.userId)
                .then((offer) => {
                  socket.emit("signal:offer", {
                    sdp: offer,
                    targetUserId: p.userId,
                    roomId,
                  });
                })
                .catch(console.error);
            }
          });
        });

        // New user joined
        socket.on("user:joined", (data) => {
          addPeer({
            userId: data.userId,
            displayName: data.displayName,
            avatarUrl: data.avatarUrl,
            isMuted: false,
            isVideoOn: true,
            stream: null,
          });
          toast.info(`${data.displayName} joined the call`);
        });

        // User left
        socket.on("user:left", ({ userId: leftId }) => {
          removePeer(leftId);
          manager.removePeer(leftId);
          toast.info("A participant left the call");
        });

        // Handle incoming offer
        socket.on("signal:offer", async ({ sdp, fromUserId }) => {
          const answer = await manager.handleOffer(fromUserId, sdp, {
            userId: fromUserId,
            onTrack: (stream, uid) => updatePeerStream(uid, stream),
            onIceCandidate: (candidate, uid) => {
              socket.emit("signal:ice-candidate", {
                candidate: candidate.toJSON(),
                targetUserId: uid,
                roomId,
              });
            },
            onConnectionStateChange: (state, uid) => {
              console.log(`[WebRTC] Peer ${uid} state: ${state}`);
            },
          });

          socket.emit("signal:answer", {
            sdp: answer,
            targetUserId: fromUserId,
            roomId,
          });
        });

        // Handle incoming answer
        socket.on("signal:answer", ({ sdp, fromUserId }) => {
          manager.handleAnswer(fromUserId, sdp).catch(console.error);
        });

        // Handle ICE candidates
        socket.on("signal:ice-candidate", ({ candidate, fromUserId }) => {
          manager.addIceCandidate(fromUserId, candidate).catch(console.error);
        });

        // Handle captions
        socket.on("caption:new", (data) => {
          useCaptionStore.getState().addCaption({
            id: crypto.randomUUID(),
            callId: roomId,
            userId: data.userId,
            sourceType: data.source,
            rawText: data.text,
            correctedText: null,
            confidence: data.confidence,
            language: "en",
            timestampMs: data.timestamp,
            createdAt: new Date().toISOString(),
            user: { displayName: data.displayName, avatarUrl: null },
          });
        });

        // Handle chat messages
        socket.on("chat:message", (msg) => {
          setChatMessages((prev) => [...prev, msg]);
        });

        // Handle media state changes
        socket.on("user:mute-changed", ({ userId: uid, isMuted: muted }) => {
          updatePeerMedia(uid, { isMuted: muted });
        });

        socket.on("user:video-changed", ({ userId: uid, isVideoOn: videoOn }) => {
          updatePeerMedia(uid, { isVideoOn: videoOn });
        });

        // Handle call ended
        socket.on("call:ended", () => {
          handleEndCall();
        });

        setCallActive(roomId, roomId);
      } catch (err) {
        console.error("[Call] Init failed:", err);
        toast.error("Could not access camera/microphone");
      }
    }

    initCall();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.id]);

  // --- Handlers ---
  const handleEndCall = useCallback(() => {
    const socket = getSocket();
    socket.emit("room:leave", { roomId });
    webrtcRef.current?.destroy();
    endCall();
    router.push("/dashboard");
  }, [roomId, endCall, router]);

  const handleToggleMute = useCallback(() => {
    toggleMute();
    const socket = getSocket();
    socket.emit("user:mute-toggle", {
      roomId,
      isMuted: !isMuted,
    });
  }, [toggleMute, roomId, isMuted]);

  const handleToggleVideo = useCallback(() => {
    toggleVideo();
    const socket = getSocket();
    socket.emit("user:video-toggle", {
      roomId,
      isVideoOn: !isVideoOn,
    });
  }, [toggleVideo, roomId, isVideoOn]);

  const handleToggleScreenShare = useCallback(async () => {
    if (!webrtcRef.current) return;

    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" } as MediaTrackConstraints,
          audio: false,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        await webrtcRef.current.replaceTrack("video", screenTrack);
        toggleScreenShare();

        screenTrack.onended = () => {
          // Revert to camera when screen share stops
          const cameraTrack = localStream?.getVideoTracks()[0];
          if (cameraTrack) {
            webrtcRef.current?.replaceTrack("video", cameraTrack);
          }
          toggleScreenShare();
        };
      } catch (err) {
        console.log("[ScreenShare] User cancelled");
      }
    } else {
      const cameraTrack = localStream?.getVideoTracks()[0];
      if (cameraTrack) {
        await webrtcRef.current.replaceTrack("video", cameraTrack);
      }
      toggleScreenShare();
    }
  }, [isScreenSharing, localStream, toggleScreenShare]);

  const handleSendMessage = useCallback(
    (content: string) => {
      const socket = getSocket();
      socket.emit("chat:message", {
        content,
        callId: roomId,
        type: "text",
      });
    },
    [roomId]
  );

  // --- Render peers ---
  const peerEntries = Array.from(peers.entries());
  const totalVideos = 1 + peerEntries.length;

  const gridCols =
    totalVideos <= 1
      ? "grid-cols-1"
      : totalVideos <= 2
      ? "grid-cols-1 md:grid-cols-2"
      : totalVideos <= 4
      ? "grid-cols-2"
      : "grid-cols-2 lg:grid-cols-3";

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <Clock size={14} className="text-white/70" />
            <span className="text-sm font-mono text-white/80">{elapsed}</span>
          </div>
          {isSignTracking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-primary-500)]/20 border border-[var(--color-primary-500)]/30"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary-400)] animate-pulse" />
              <span className="text-xs font-medium text-[var(--color-primary-400)]">
                Sign Tracking
              </span>
            </motion.div>
          )}
        </div>
        <div className="text-xs text-white/50 font-mono">
          Room: {roomId.slice(0, 8)}...
        </div>
      </div>

      {/* Video Grid */}
      <div className={`flex-1 grid ${gridCols} gap-2 p-2 pt-14 pb-24`}>
        {/* Local video */}
        <VideoPlayer
          ref={setVideoEl}
          stream={localStream}
          name={user?.displayName || "You"}
          isMuted={isMuted}
          isVideoOff={!isVideoOn}
          isLocal
        />

        {/* Remote videos */}
        {peerEntries.map(([userId, peer]) => (
          <VideoPlayer
            key={userId}
            stream={peer.stream}
            name={peer.displayName}
            isMuted={peer.isMuted}
            isVideoOff={!peer.isVideoOn}
          />
        ))}
      </div>

      {/* Caption Overlay */}
      <CaptionOverlay />

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        currentUserId={user?.id || ""}
      />

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 py-4 px-4">
        <div className="glass rounded-2xl px-4 py-3 max-w-2xl mx-auto">
          <CallControls
            isMuted={isMuted}
            isVideoOn={isVideoOn}
            isScreenSharing={isScreenSharing}
            isRecording={isRecording}
            isChatOpen={isChatOpen}
            isSignTrackingActive={isSignTracking}
            onToggleMute={handleToggleMute}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
            onToggleRecording={toggleRecording}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
            onToggleSignTracking={() => setIsSignTracking(!isSignTracking)}
            onEndCall={handleEndCall}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
      </div>
    </div>
  );
}
