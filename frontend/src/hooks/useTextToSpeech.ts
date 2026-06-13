import { useEffect, useCallback } from "react";
import { useCaptionStore } from "@/stores/captionStore";
import { useAuthStore } from "@/stores/authStore";

export function useTextToSpeech(roomId: string, isActive: boolean) {
  const { captions } = useCaptionStore();
  const { user } = useAuthStore();

  const speakNative = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.includes("en-") && !v.localService) || voices[0];
    if (voice) utterance.voice = voice;
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!isActive) return;

    try {
      const ttsUrl = process.env.NEXT_PUBLIC_TTS_URL || "http://localhost:8002/api/tts/synthesize";
      const response = await fetch(ttsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "en" })
      });

      if (!response.ok) throw new Error("TTS API failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();

    } catch (err) {
      console.warn("[TTS] Python API failed or offline. Falling back to native browser speech.");
      speakNative(text);
    }
  }, [isActive, speakNative]);

  // Listen to new captions
  useEffect(() => {
    if (!isActive || !user) return;
    
    // In a real app, we'd trigger this exactly when the caption is received over socket.
    // Here we listen to the store changes and grab the latest one if it's from someone else.
    // We only want to trigger on newly added captions, not re-renders.
    
    // To do this cleanly, we assume the last caption in the array is the newest.
    // If it was created within the last 500ms and not by us, read it.
    const latestCaption = captions[captions.length - 1];
    
    if (latestCaption && latestCaption.userId !== user.id) {
      const age = Date.now() - latestCaption.timestampMs;
      if (age < 1000) { // Only read it if it just arrived
        speak(latestCaption.correctedText || latestCaption.rawText);
      }
    }
  }, [captions, user, isActive, speak]);

  // Ensure voices are loaded for fallback
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return { speak };
}
