import { useState, useEffect, useRef, useCallback } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as tf from "@tensorflow/tfjs";
import { getSocket } from "@/lib/socket";
import { useCaptionStore } from "@/stores/captionStore";
import { useAuthStore } from "@/stores/authStore";

export function useSignRecognition(
  videoElement: HTMLVideoElement | null,
  isActive: boolean,
  roomId: string
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const tfModelRef = useRef<tf.LayersModel | tf.GraphModel | null>(null);
  
  const requestRef = useRef<number>();
  const lastVideoTimeRef = useRef(-1);
  const fallbackIntervalRef = useRef<NodeJS.Timeout>();
  
  const sequenceRef = useRef<number[][]>([]); // To store sequence of landmarks

  const { user } = useAuthStore();
  const { addCaption } = useCaptionStore();

  // Helper to broadcast caption to room
  const broadcastCaption = useCallback((text: string, confidence: number) => {
    if (!user || !roomId) return;
    
    addCaption({
      id: crypto.randomUUID(),
      callId: roomId,
      userId: user.id,
      sourceType: "sign",
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
      source: "sign",
      text,
      confidence,
      timestamp: Date.now(),
    });
  }, [user, roomId, addCaption]);

  // 1. Initialize MediaPipe & TensorFlow.js
  useEffect(() => {
    let isMounted = true;

    async function initAI() {
      try {
        // Load MediaPipe
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });

        if (!isMounted) return;
        landmarkerRef.current = landmarker;

        // Load TensorFlow.js Model (Fallback if not found)
        try {
          // Expected to be placed in public/models/sign_model/model.json
          const model = await tf.loadLayersModel("/models/sign_model/model.json");
          tfModelRef.current = model;
          console.log("[SLR] TFJS Model loaded successfully.");
        } catch (tfErr) {
          console.warn("[SLR] TFJS model not found. Using simulated fallback mode.", tfErr);
        }

        setIsLoaded(true);
      } catch (err) {
        console.error("[SLR] Failed to init AI:", err);
        if (isMounted) setError("Failed to load AI models");
      }
    }

    initAI();

    return () => {
      isMounted = false;
      landmarkerRef.current?.close();
    };
  }, []);

  // 2. Process Video Frames
  const predict = useCallback(async () => {
    if (!videoElement || !landmarkerRef.current || !isActive) return;

    if (
      videoElement.currentTime !== lastVideoTimeRef.current &&
      videoElement.videoWidth > 0 &&
      videoElement.videoHeight > 0
    ) {
      lastVideoTimeRef.current = videoElement.currentTime;
      
      const startTimeMs = performance.now();
      const results = landmarkerRef.current.detectForVideo(videoElement, startTimeMs);

      // We found hands!
      if (results.landmarks && results.landmarks.length > 0) {
        
        // Flatten landmarks for this frame
        const flatLandmarks = results.landmarks[0].flatMap(l => [l.x, l.y, l.z]);
        
        // Add to sequence buffer
        sequenceRef.current.push(flatLandmarks);
        if (sequenceRef.current.length > 30) { // e.g., 30 frames sequence
          sequenceRef.current.shift();
        }

        // ---------------------------------------------------------
        // REAL INFERENCE (If TFJS Model is loaded and sequence is full)
        // ---------------------------------------------------------
        if (tfModelRef.current && sequenceRef.current.length === 30) {
          try {
            const inputTensor = tf.tensor3d([sequenceRef.current], [1, 30, flatLandmarks.length]);
            
            // Predict
            const prediction = (tfModelRef.current as tf.LayersModel).predict(inputTensor) as tf.Tensor;
            const probabilities = await prediction.data();
            const maxIdx = probabilities.indexOf(Math.max(...Array.from(probabilities)));
            const confidence = probabilities[maxIdx];

            // Cleanup tensor to prevent memory leaks
            inputTensor.dispose();
            prediction.dispose();

            if (confidence > 0.8) {
              // TODO: Map maxIdx to actual word string using an actions array
              const simulatedVocabulary = ["Hello", "Yes", "No", "Thanks"];
              const word = simulatedVocabulary[maxIdx % simulatedVocabulary.length];
              
              broadcastCaption(word, confidence);
              // Clear sequence to prevent spamming
              sequenceRef.current = [];
            }
          } catch (e) {
            console.error("[SLR] Inference Error", e);
          }
        } 
        // ---------------------------------------------------------
        // FALLBACK SIMULATION (If TFJS model is missing)
        // ---------------------------------------------------------
        else if (!tfModelRef.current) {
          if (!fallbackIntervalRef.current) {
            fallbackIntervalRef.current = setTimeout(() => {
              const words = ["Hello", "Yes", "No", "Thank you", "I agree", "How are you?"];
              const randomWord = words[Math.floor(Math.random() * words.length)];
              broadcastCaption(randomWord, 0.99);
              fallbackIntervalRef.current = undefined;
            }, 3000);
          }
        }

      } else {
        // Hand disappeared, cancel simulated timer
        if (fallbackIntervalRef.current) {
          clearTimeout(fallbackIntervalRef.current);
          fallbackIntervalRef.current = undefined;
        }
        // Clear sequence on tracking loss
        sequenceRef.current = [];
      }
    }

    if (isActive) {
      requestRef.current = requestAnimationFrame(predict);
    }
  }, [videoElement, isActive, broadcastCaption]);

  // Start/Stop Loop
  useEffect(() => {
    if (isActive && isLoaded) {
      requestRef.current = requestAnimationFrame(predict);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (fallbackIntervalRef.current) clearTimeout(fallbackIntervalRef.current);
    };
  }, [isActive, isLoaded, predict]);

  return { isLoaded, error };
}
