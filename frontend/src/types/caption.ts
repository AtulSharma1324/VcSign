// ===========================
// Caption & Translation Types
// ===========================

export interface Caption {
  id: string;
  callId: string;
  userId: string;
  sourceType: "sign_language" | "speech";
  rawText: string;
  correctedText: string | null;
  confidence: number;
  language: string;
  timestampMs: number;
  createdAt: string;
  user?: {
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface CaptionSettings {
  size: "small" | "medium" | "large" | "xlarge";
  position: "top" | "bottom" | "left" | "right";
  font: string;
  showSpeaker: boolean;
  showConfidence: boolean;
  autoHide: boolean;
  autoHideDelay: number;
}

export interface SignRecognitionResult {
  sign: string;
  confidence: number;
  timestamp: number;
  isPartial: boolean;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  language: string;
  timestamp: number;
}

export interface TTSRequest {
  text: string;
  voice: string;
  speed: number;
  language: string;
}
