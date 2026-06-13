// ===========================
// Call Types
// ===========================

export interface Call {
  id: string;
  roomId: string;
  callType: "one_on_one" | "group";
  status: "ringing" | "active" | "ended" | "missed" | "declined";
  initiatedBy: string;
  startedAt: string | null;
  endedAt: string | null;
  durationSecs: number | null;
  recordingUrl: string | null;
  isEncrypted: boolean;
  createdAt: string;
  participants: CallParticipant[];
}

export interface CallParticipant {
  id: string;
  callId: string;
  userId: string;
  role: "host" | "participant";
  joinedAt: string | null;
  leftAt: string | null;
  isMuted: boolean;
  isVideoOn: boolean;
  user?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface TurnCredentials {
  urls: string[];
  username: string;
  credential: string;
}

export interface CallState {
  isInCall: boolean;
  roomId: string | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: CallParticipant[];
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
}
