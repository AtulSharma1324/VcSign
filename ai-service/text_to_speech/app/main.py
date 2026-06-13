"""
Text-to-Speech Service — FastAPI
=================================
Text-to-speech synthesis using Piper TTS (offline) with Google Cloud TTS fallback.
"""

import os
import io
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

piper_voice = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    global piper_voice
    logger.info("[TTS] Loading Piper TTS voice model...")

    try:
        # Try loading Piper TTS
        from piper import PiperVoice

        voice_dir = os.path.join(os.path.dirname(__file__), "voices")
        voice_model = os.path.join(voice_dir, "en_US-lessac-medium.onnx")

        if os.path.exists(voice_model):
            piper_voice = PiperVoice.load(voice_model)
            logger.info("[TTS] Piper voice loaded successfully")
        else:
            logger.warning(f"[TTS] Voice model not found at {voice_model}")
    except ImportError:
        logger.warning("[TTS] Piper TTS not installed, will use Google Cloud TTS")
    except Exception as e:
        logger.warning(f"[TTS] Failed to load Piper: {e}")

    yield

    piper_voice = None
    logger.info("[TTS] Shutdown complete")


app = FastAPI(
    title="Text-to-Speech Service",
    description="Converts text into natural speech audio using Piper TTS or Google Cloud TTS",
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


class SynthesizeRequest(BaseModel):
    text: str
    voice: str = "default"
    speed: float = 1.0
    language: str = "en"


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "text-to-speech",
        "piper_loaded": piper_voice is not None,
    }


@app.post("/api/tts/synthesize")
async def synthesize(request: SynthesizeRequest):
    """
    Synthesize speech from text.
    Returns audio/wav stream.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    if len(request.text) > 1000:
        raise HTTPException(status_code=400, detail="Text too long (max 1000 chars)")

    try:
        # Try Piper TTS first (offline, fast)
        if piper_voice is not None:
            audio_buffer = io.BytesIO()
            piper_voice.synthesize(request.text, audio_buffer, sentence_silence=0.3)
            audio_buffer.seek(0)

            return StreamingResponse(
                audio_buffer,
                media_type="audio/wav",
                headers={
                    "Content-Disposition": "inline; filename=speech.wav",
                    "Cache-Control": "no-cache",
                },
            )

        # Fallback to Google Cloud TTS
        return await _google_tts(request)

    except Exception as e:
        logger.error(f"[TTS] Synthesis error: {e}")
        raise HTTPException(status_code=500, detail="Speech synthesis failed")


async def _google_tts(request: SynthesizeRequest) -> StreamingResponse:
    """Fallback: Google Cloud Text-to-Speech."""
    try:
        from google.cloud import texttospeech

        client = texttospeech.TextToSpeechClient()

        synthesis_input = texttospeech.SynthesisInput(text=request.text)

        voice_params = texttospeech.VoiceSelectionParams(
            language_code=request.language,
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.LINEAR16,
            speaking_rate=request.speed,
        )

        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice_params,
            audio_config=audio_config,
        )

        audio_buffer = io.BytesIO(response.audio_content)
        return StreamingResponse(
            audio_buffer,
            media_type="audio/wav",
            headers={"Content-Disposition": "inline; filename=speech.wav"},
        )
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="No TTS engine available. Install piper-tts or google-cloud-texttospeech.",
        )


@app.get("/api/tts/voices")
async def list_voices():
    """List available TTS voices."""
    voices = []
    if piper_voice is not None:
        voices.append({
            "id": "piper-lessac",
            "name": "Lessac (English US)",
            "language": "en-US",
            "engine": "piper",
        })

    # Add Google voices if configured
    if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        voices.extend([
            {"id": "google-en-us", "name": "English (US)", "language": "en-US", "engine": "google"},
            {"id": "google-en-gb", "name": "English (UK)", "language": "en-GB", "engine": "google"},
            {"id": "google-hi-in", "name": "Hindi", "language": "hi-IN", "engine": "google"},
        ])

    return {"voices": voices}
