import { create } from "zustand";
import type { Caption, CaptionSettings } from "@/types/caption";
import { MAX_CAPTION_HISTORY } from "@/lib/constants";

// ===========================
// Caption Store (Zustand)
// ===========================

interface CaptionStore {
  captions: Caption[];
  currentCaption: string | null;
  currentSpeaker: string | null;
  settings: CaptionSettings;
  isVisible: boolean;

  // Actions
  addCaption: (caption: Caption) => void;
  setCurrentCaption: (text: string | null, speaker?: string | null) => void;
  clearCaptions: () => void;
  updateSettings: (settings: Partial<CaptionSettings>) => void;
  toggleVisibility: () => void;
}

export const useCaptionStore = create<CaptionStore>((set) => ({
  captions: [],
  currentCaption: null,
  currentSpeaker: null,
  isVisible: true,
  settings: {
    size: "medium",
    position: "bottom",
    font: "Inter",
    showSpeaker: true,
    showConfidence: false,
    autoHide: true,
    autoHideDelay: 5000,
  },

  addCaption: (caption) =>
    set((state) => ({
      captions: [...state.captions, caption].slice(-MAX_CAPTION_HISTORY),
      currentCaption: caption.correctedText || caption.rawText,
      currentSpeaker: caption.user?.displayName || null,
    })),

  setCurrentCaption: (text, speaker = null) =>
    set({ currentCaption: text, currentSpeaker: speaker }),

  clearCaptions: () =>
    set({ captions: [], currentCaption: null, currentSpeaker: null }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  toggleVisibility: () =>
    set((state) => ({ isVisible: !state.isVisible })),
}));
