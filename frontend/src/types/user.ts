// ===========================
// User Types
// ===========================

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  userType: "deaf" | "hearing" | "both";
  preferredLang: string;
  signLanguage: string;
  isVerified: boolean;
  oauthProvider: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  captionSize: "small" | "medium" | "large" | "xlarge";
  captionFont: string;
  captionPosition: "top" | "bottom" | "left" | "right";
  darkMode: boolean;
  ttsVoice: string;
  ttsSpeed: number;
  autoRecord: boolean;
  emergencyMode: boolean;
}

export interface Contact {
  id: string;
  userId: string;
  contactUserId: string;
  nickname: string | null;
  isFavorite: boolean;
  user: User;
  createdAt: string;
}
