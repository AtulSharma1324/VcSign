"""
Sign Language Recognition — FastAPI Service
============================================
Real-time sign language gesture recognition using MediaPipe landmarks + LSTM classifier.
"""

import os
import json
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.services.model_manager import ModelManager
from app.services.gesture_classifier import GestureClassifier
from app.services.sentence_builder import SentenceBuilder

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Globals ---
model_manager: ModelManager | None = None
gesture_classifier: GestureClassifier | None = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Load ML models on startup, clean up on shutdown."""
    global model_manager, gesture_classifier

    logger.info("[SignAI] Loading models...")
    model_manager = ModelManager()
    gesture_classifier = GestureClassifier(model_manager)
    logger.info("[SignAI] Models loaded successfully")

    yield

    logger.info("[SignAI] Shutting down, releasing resources")
    model_manager = None
    gesture_classifier = None


app = FastAPI(
    title="Sign Language Recognition Service",
    description="Real-time ISL sign language recognition via MediaPipe landmarks",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("APP_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Health Check ---
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "sign-recognition",
        "model_loaded": gesture_classifier is not None,
    }


# --- WebSocket: Real-time Sign Recognition ---
@app.websocket("/ws/sign-recognition")
async def sign_recognition_ws(websocket: WebSocket):
    """
    WebSocket endpoint for real-time sign language recognition.

    Client sends JSON frames with MediaPipe landmark data:
    {
        "landmarks": [[x, y, z], ...],  // 543 landmarks × 3 coords
        "timestamp": 1234567890
    }

    Server responds with recognized signs:
    {
        "sign": "hello",
        "confidence": 0.95,
        "sentence": "Hello, how are you?",
        "is_partial": false
    }
    """
    await websocket.accept()
    sentence_builder = SentenceBuilder()

    logger.info("[SignAI] Client connected for sign recognition")

    try:
        while True:
            data = await websocket.receive_text()
            frame = json.loads(data)

            landmarks = frame.get("landmarks", [])
            timestamp = frame.get("timestamp", 0)

            if not landmarks or gesture_classifier is None:
                continue

            # Classify gesture from landmark sequence
            result = gesture_classifier.classify(landmarks, timestamp)

            if result is not None:
                sign, confidence = result

                # Build sentence from individual signs
                sentence = sentence_builder.add_sign(sign, confidence)

                await websocket.send_json({
                    "sign": sign,
                    "confidence": round(confidence, 4),
                    "sentence": sentence,
                    "is_partial": sentence_builder.is_partial,
                    "timestamp": timestamp,
                })

    except WebSocketDisconnect:
        logger.info("[SignAI] Client disconnected")
    except Exception as e:
        logger.error(f"[SignAI] WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))


# --- REST: Model Info ---
@app.get("/api/model/info")
async def model_info():
    if model_manager is None:
        return {"error": "Model not loaded"}
    return {
        "language": model_manager.language,
        "version": model_manager.version,
        "vocab_size": model_manager.vocab_size,
        "sequence_length": model_manager.sequence_length,
    }
