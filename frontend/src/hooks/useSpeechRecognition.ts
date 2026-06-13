import { useState, useEffect, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useCaptionStore } from "@/stores/captionStore";
import { useAuthStore } from "@/stores/authStore";

export function useSpeechRecognition(isActive: boolean, roomId: string) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { user } = useAuthStore();
  const { addCaption } = useCaptionStore();

  const broadcastCaption = useCallback(
    (text: string, confidence: number) => {
      if (!user || !roomId) return;

      addCaption({
        id: crypto.randomUUID(),
        callId: roomId,
        userId: user.id,
        sourceType: "speech",
        rawText: text,
        correctedText: null,
        confidence,
        language: "en",
        timestampMs: Date.now(),
        createdAt: new Date().toISOString(),
        user: { displayName: user.displayName, avatarUrl: user.avatarUrl },
      });

      const socket = getSocket();
      socket.emit("caption:new", {
        roomId,
        userId: user.id,
        displayName: user.displayName,
        source: "speech",
        text,
        confidence,
        timestamp: Date.now(),
      });
    },
    [user, roomId, addCaption]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if it was supposed to be active
      if (isActive && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    };

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript.trim();
          const confidence = event.results[i][0].confidence;
          if (text) {
            broadcastCaption(text, confidence);
          }
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isActive, broadcastCaption]);

  useEffect(() => {
    if (isActive && !isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else if (!isActive && isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isActive, isListening]);

  return { isListening };
}
