"""
Speech-to-Text Service — FastAPI
=================================
Real-time speech transcription using Faster-Whisper with Voice Activity Detection.
"""

import os
import io
import json
import logging
import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import numpy as np
import soundfile as sf
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Globals ---
whisper_model = None
vad_model = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    global whisper_model, vad_model

    logger.info("[STT] Loading Whisper model...")
    model_size = os.getenv("WHISPER_MODEL_SIZE", "medium")
    device = os.getenv("WHISPER_DEVICE", "cpu")
    compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")

    try:
        from faster_whisper import WhisperModel
        whisper_model = WhisperModel(
            model_size,
            device=device,
            compute_type=compute_type,
        )
        logger.info(f"[STT] Whisper '{model_size}' loaded on {device}")
    except Exception as e:
        logger.error(f"[STT] Failed to load Whisper: {e}")

    # Load VAD
    try:
        import torch
        vad_model, vad_utils = torch.hub.load(
            repo_or_dir="snakers4/silero-vad",
            model="silero_vad",
            force_reload=False,
            trust_repo=True,
        )
        logger.info("[STT] Silero VAD loaded")
    except Exception as e:
        logger.warning(f"[STT] VAD not available: {e}")

    yield

    whisper_model = None
    vad_model = None
    logger.info("[STT] Shutdown complete")


app = FastAPI(
    title="Speech-to-Text Service",
    description="Real-time speech transcription using Faster-Whisper + Silero VAD",
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


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "speech-to-text",
        "model_loaded": whisper_model is not None,
    }


@app.websocket("/ws/transcribe")
async def transcribe_ws(websocket: WebSocket):
    """
    WebSocket endpoint for real-time speech-to-text.

    Client sends raw audio bytes (16kHz, mono, PCM float32).
    Server responds with transcription results:
    {
        "text": "Hello how are you",
        "confidence": 0.92,
        "is_final": true,
        "language": "en"
    }
    """
    await websocket.accept()
    audio_buffer = bytearray()
    CHUNK_DURATION_SECS = 2  # Process every 2 seconds of audio
    SAMPLE_RATE = 16000
    CHUNK_SIZE = SAMPLE_RATE * CHUNK_DURATION_SECS * 4  # float32 = 4 bytes

    logger.info("[STT] Client connected for transcription")

    try:
        while True:
            data = await websocket.receive_bytes()
            audio_buffer.extend(data)

            # Process when we have enough audio
            if len(audio_buffer) >= CHUNK_SIZE:
                chunk = bytes(audio_buffer[:CHUNK_SIZE])
                audio_buffer = audio_buffer[CHUNK_SIZE:]

                # Convert bytes to numpy array
                audio_array = np.frombuffer(chunk, dtype=np.float32)

                # Skip silence if VAD is available
                if vad_model is not None:
                    import torch
                    audio_tensor = torch.tensor(audio_array)
                    speech_prob = vad_model(audio_tensor, SAMPLE_RATE).item()
                    if speech_prob < 0.5:
                        continue  # Skip silent chunks

                # Transcribe with Whisper
                if whisper_model is not None:
                    segments, info = whisper_model.transcribe(
                        audio_array,
                        beam_size=5,
                        language="en",
                        condition_on_previous_text=True,
                        vad_filter=True,
                    )

                    full_text = ""
                    avg_confidence = 0.0
                    seg_count = 0

                    for segment in segments:
                        full_text += segment.text
                        avg_confidence += segment.avg_logprob
                        seg_count += 1

                    if full_text.strip():
                        confidence = (
                            min(1.0, max(0.0, 1.0 + (avg_confidence / max(seg_count, 1))))
                            if seg_count > 0
                            else 0.0
                        )

                        await websocket.send_json({
                            "text": full_text.strip(),
                            "confidence": round(confidence, 4),
                            "is_final": True,
                            "language": info.language or "en",
                        })

    except WebSocketDisconnect:
        logger.info("[STT] Client disconnected")
    except Exception as e:
        logger.error(f"[STT] WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))
