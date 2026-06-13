// ===========================
// Application Constants
// ===========================

export const APP_NAME = "SignLang VC";
export const APP_DESCRIPTION =
  "AI-Powered Sign Language Video Call Translator";

// --- API URLs ---
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:4001/api/auth";
export const USER_API_URL =
  process.env.NEXT_PUBLIC_USER_URL || "http://localhost:4002/api/users";
export const CALL_API_URL =
  process.env.NEXT_PUBLIC_CALL_URL || "http://localhost:4003/api/calls";
export const CHAT_API_URL =
  process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:4004/api/chat";
export const SIGNALING_URL =
  process.env.NEXT_PUBLIC_SIGNALING_URL || "http://localhost:4000";

// --- AI Service URLs ---
export const SIGN_RECOGNITION_WS_URL =
  process.env.NEXT_PUBLIC_SIGN_AI_WS || "ws://localhost:8000/ws/sign-recognition";
export const STT_WS_URL =
  process.env.NEXT_PUBLIC_STT_WS || "ws://localhost:8001/ws/transcribe";
export const TTS_API_URL =
  process.env.NEXT_PUBLIC_TTS_URL || "http://localhost:8002/api/tts";
export const NLP_API_URL =
  process.env.NEXT_PUBLIC_NLP_URL || "http://localhost:8003/api/nlp";

// --- WebRTC ---
export const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: "user",
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000,
  },
};

// --- MediaPipe ---
export const MEDIAPIPE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models";
export const HAND_LANDMARK_CONNECTIONS = 21;
export const POSE_LANDMARK_CONNECTIONS = 33;
export const FACE_LANDMARK_CONNECTIONS = 468;
export const LANDMARK_SEQUENCE_LENGTH = 30; // frames per sequence
export const LANDMARK_OVERLAP = 15; // frame overlap for sliding window

// --- Caption Settings ---
export const CAPTION_SIZES = {
  small: "0.875rem",
  medium: "1.125rem",
  large: "1.375rem",
  xlarge: "1.625rem",
} as const;

export const CAPTION_AUTO_HIDE_MS = 5000;
export const MAX_CAPTION_HISTORY = 100;

// --- Emergency Phrases ---
export const EMERGENCY_PHRASES = [
  { key: "help", text: "I need help", icon: "🆘" },
  { key: "ambulance", text: "Please call an ambulance", icon: "🚑" },
  { key: "pain", text: "I am in pain", icon: "💊" },
  { key: "understand", text: "I don't understand", icon: "❓" },
  { key: "repeat", text: "Please repeat that", icon: "🔄" },
  { key: "slow", text: "Please speak slowly", icon: "🐢" },
  { key: "write", text: "Can you write it down?", icon: "✍️" },
  { key: "yes", text: "Yes", icon: "✅" },
  { key: "no", text: "No", icon: "❌" },
  { key: "thankyou", text: "Thank you", icon: "🙏" },
] as const;

// --- Misc ---
export const MAX_GROUP_CALL_PARTICIPANTS = 8;
export const TOKEN_REFRESH_THRESHOLD_MS = 60_000; // 1 minute before expiry
