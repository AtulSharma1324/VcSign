import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ===========================
// Settings Store (Zustand)
// ===========================

interface SettingsStore {
  // Display
  theme: "light" | "dark" | "system";
  language: string;
  highContrast: boolean;

  // Caption
  captionSize: "small" | "medium" | "large" | "xlarge";
  captionPosition: "top" | "bottom";
  captionFont: string;

  // TTS
  ttsVoice: string;
  ttsSpeed: number;
  ttsEnabled: boolean;

  // Call
  autoRecord: boolean;
  signLanguage: "ISL" | "ASL";
  emergencyMode: boolean;

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLanguage: (lang: string) => void;
  setCaptionSize: (size: "small" | "medium" | "large" | "xlarge") => void;
  setCaptionPosition: (pos: "top" | "bottom") => void;
  setTtsVoice: (voice: string) => void;
  setTtsSpeed: (speed: number) => void;
  setTtsEnabled: (enabled: boolean) => void;
  setAutoRecord: (auto: boolean) => void;
  setSignLanguage: (lang: "ISL" | "ASL") => void;
  setEmergencyMode: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaults = {
  theme: "dark" as const,
  language: "en",
  highContrast: false,
  captionSize: "medium" as const,
  captionPosition: "bottom" as const,
  captionFont: "Inter",
  ttsVoice: "default",
  ttsSpeed: 1.0,
  ttsEnabled: true,
  autoRecord: false,
  signLanguage: "ISL" as const,
  emergencyMode: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaults,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setCaptionSize: (captionSize) => set({ captionSize }),
      setCaptionPosition: (captionPosition) => set({ captionPosition }),
      setTtsVoice: (ttsVoice) => set({ ttsVoice }),
      setTtsSpeed: (ttsSpeed) => set({ ttsSpeed }),
      setTtsEnabled: (ttsEnabled) => set({ ttsEnabled }),
      setAutoRecord: (autoRecord) => set({ autoRecord }),
      setSignLanguage: (signLanguage) => set({ signLanguage }),
      setEmergencyMode: (emergencyMode) => set({ emergencyMode }),
      setHighContrast: (highContrast) => set({ highContrast }),
      resetToDefaults: () => set(defaults),
    }),
    {
      name: "signlang-vc-settings",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
