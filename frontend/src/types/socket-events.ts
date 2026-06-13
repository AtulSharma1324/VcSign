// ===========================
// Socket.IO Event Types
// ===========================

/** Client-to-Server events */
export interface ClientToServerEvents {
  "room:join": (data: { roomId: string; userId: string }) => void;
  "room:leave": (data: { roomId: string }) => void;
  "signal:offer": (data: {
    sdp: RTCSessionDescriptionInit;
    targetUserId: string;
    roomId: string;
  }) => void;
  "signal:answer": (data: {
    sdp: RTCSessionDescriptionInit;
    targetUserId: string;
    roomId: string;
  }) => void;
  "signal:ice-candidate": (data: {
    candidate: RTCIceCandidateInit;
    targetUserId: string;
    roomId: string;
  }) => void;
  "chat:message": (data: {
    content: string;
    callId: string;
    type: "text" | "emoji" | "file";
  }) => void;
  "caption:send": (data: {
    text: string;
    source: "sign_language" | "speech";
    confidence: number;
    roomId: string;
  }) => void;
  "user:mute-toggle": (data: {
    roomId: string;
    isMuted: boolean;
  }) => void;
  "user:video-toggle": (data: {
    roomId: string;
    isVideoOn: boolean;
  }) => void;
}

/** Server-to-Client events */
export interface ServerToClientEvents {
  "room:joined": (data: {
    roomId: string;
    participants: Array<{
      userId: string;
      displayName: string;
      avatarUrl: string | null;
    }>;
  }) => void;
  "user:joined": (data: {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
  }) => void;
  "user:left": (data: { userId: string }) => void;
  "signal:offer": (data: {
    sdp: RTCSessionDescriptionInit;
    fromUserId: string;
  }) => void;
  "signal:answer": (data: {
    sdp: RTCSessionDescriptionInit;
    fromUserId: string;
  }) => void;
  "signal:ice-candidate": (data: {
    candidate: RTCIceCandidateInit;
    fromUserId: string;
  }) => void;
  "chat:message": (data: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    type: "text" | "emoji" | "file" | "system";
    createdAt: string;
  }) => void;
  "caption:new": (data: {
    text: string;
    userId: string;
    displayName: string;
    source: "sign_language" | "speech";
    confidence: number;
    timestamp: number;
  }) => void;
  "call:ended": (data: { callId: string; duration: number }) => void;
  "user:mute-changed": (data: {
    userId: string;
    isMuted: boolean;
  }) => void;
  "user:video-changed": (data: {
    userId: string;
    isVideoOn: boolean;
  }) => void;
  error: (data: { message: string; code: string }) => void;
}
