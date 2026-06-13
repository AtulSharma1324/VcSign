"""
NLP Engine — FastAPI Service
=============================
Grammar correction, sentence prediction, emotion detection, and meeting summarization.
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

grammar_model = None
summarizer_model = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    global grammar_model, summarizer_model

    logger.info("[NLP] Loading models...")

    try:
        from transformers import pipeline

        # Grammar correction model (T5-small for speed)
        grammar_model = pipeline(
            "text2text-generation",
            model="vennify/t5-base-grammar-correction",
            device=-1,  # CPU
        )
        logger.info("[NLP] Grammar correction model loaded")

        # Summarization model
        summarizer_model = pipeline(
            "summarization",
            model="facebook/bart-large-cnn",
            device=-1,
        )
        logger.info("[NLP] Summarization model loaded")

    except Exception as e:
        logger.warning(f"[NLP] Model loading failed: {e}. Using fallback.")

    yield

    grammar_model = None
    summarizer_model = None
    logger.info("[NLP] Shutdown complete")


app = FastAPI(
    title="NLP Engine",
    description="Grammar correction, sentence prediction, emotion detection, and summarization",
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


# --- Request/Response Models ---
class GrammarRequest(BaseModel):
    text: str
    source: str = "sign_language"  # sign_language or speech


class PredictRequest(BaseModel):
    partial_text: str
    context: Optional[str] = None


class SummarizeRequest(BaseModel):
    captions: list[str]
    call_duration_seconds: int = 0


class EmotionRequest(BaseModel):
    face_landmarks: list[list[float]]


# --- Endpoints ---
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "nlp-engine",
        "grammar_model_loaded": grammar_model is not None,
        "summarizer_loaded": summarizer_model is not None,
    }


@app.post("/api/nlp/correct")
async def correct_grammar(request: GrammarRequest):
    """
    Correct grammar from sign language token sequences.
    Sign language: "ME HUNGRY FOOD WANT" → "I am hungry, I want food."
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    if grammar_model is not None:
        try:
            result = grammar_model(
                f"grammar: {request.text}",
                max_length=256,
                num_return_sequences=1,
            )
            corrected = result[0]["generated_text"]
            return {
                "original": request.text,
                "corrected": corrected,
                "was_modified": corrected.lower() != request.text.lower(),
            }
        except Exception as e:
            logger.error(f"[NLP] Grammar correction error: {e}")

    # Fallback: basic capitalization and punctuation
    corrected = request.text.strip().capitalize()
    if not corrected.endswith((".", "?", "!")):
        corrected += "."
    return {
        "original": request.text,
        "corrected": corrected,
        "was_modified": True,
    }


@app.post("/api/nlp/predict")
async def predict_sentence(request: PredictRequest):
    """
    Predict the next words based on partial sign input.
    Helps complete sentences from incomplete sign sequences.
    """
    if not request.partial_text.strip():
        raise HTTPException(status_code=400, detail="Partial text is required")

    # Common sign language phrase completions
    predictions = _get_common_completions(request.partial_text)

    return {
        "partial": request.partial_text,
        "predictions": predictions,
    }


@app.post("/api/nlp/summarize")
async def summarize_meeting(request: SummarizeRequest):
    """
    Generate a meeting summary from caption history.
    """
    if not request.captions:
        raise HTTPException(status_code=400, detail="Captions are required")

    # Combine captions into text
    full_text = " ".join(request.captions)

    if summarizer_model is not None and len(full_text) > 50:
        try:
            summary = summarizer_model(
                full_text,
                max_length=200,
                min_length=30,
                do_sample=False,
            )
            return {
                "summary": summary[0]["summary_text"],
                "caption_count": len(request.captions),
                "duration_seconds": request.call_duration_seconds,
            }
        except Exception as e:
            logger.error(f"[NLP] Summarization error: {e}")

    # Fallback: extract key sentences
    sentences = [s.strip() for s in full_text.split(".") if len(s.strip()) > 10]
    summary = ". ".join(sentences[:5])
    return {
        "summary": summary or "Meeting transcript too short to summarize.",
        "caption_count": len(request.captions),
        "duration_seconds": request.call_duration_seconds,
    }


@app.post("/api/nlp/emotion")
async def detect_emotion(request: EmotionRequest):
    """
    Detect emotion from facial landmarks.
    Uses geometric features from MediaPipe face mesh.
    """
    if not request.face_landmarks:
        return {"emotion": "neutral", "confidence": 0.0}

    # Simple rule-based emotion detection from face landmarks
    # In production, replace with a trained classifier
    emotion, confidence = _analyze_face_geometry(request.face_landmarks)

    return {
        "emotion": emotion,
        "confidence": round(confidence, 4),
    }


# --- Helper Functions ---
def _get_common_completions(partial: str) -> list[dict]:
    """Common ISL phrase completions."""
    partial_lower = partial.lower().strip()

    completion_map = {
        "i": ["I am fine", "I need help", "I want to eat", "I don't understand"],
        "i am": ["I am fine, thank you", "I am hungry", "I am in pain"],
        "please": ["Please help me", "Please repeat that", "Please call a doctor"],
        "can you": ["Can you help me?", "Can you write it down?", "Can you speak slowly?"],
        "i need": ["I need help", "I need water", "I need a doctor"],
        "thank": ["Thank you very much", "Thank you for your help"],
        "where": ["Where is the hospital?", "Where is the exit?", "Where are you going?"],
    }

    for key, completions in completion_map.items():
        if partial_lower.startswith(key):
            return [
                {"text": c, "confidence": 0.8 - i * 0.1}
                for i, c in enumerate(completions)
            ]

    return [{"text": f"{partial}...", "confidence": 0.5}]


def _analyze_face_geometry(landmarks: list[list[float]]) -> tuple[str, float]:
    """
    Simple emotion detection from face landmark geometry.
    Uses mouth openness and eyebrow position as features.
    """
    if len(landmarks) < 468:
        return "neutral", 0.5

    try:
        import numpy as np

        pts = np.array(landmarks)

        # Mouth openness (vertical distance between lips)
        upper_lip = pts[13]  # Upper lip center
        lower_lip = pts[14]  # Lower lip center
        mouth_open = np.linalg.norm(upper_lip - lower_lip)

        # Eyebrow position
        left_brow = pts[70]
        left_eye = pts[159]
        brow_raise = left_brow[1] - left_eye[1]

        if mouth_open > 0.05:
            return "surprised", 0.7
        elif brow_raise < -0.02:
            return "angry", 0.6
        elif mouth_open > 0.02:
            return "happy", 0.65
        else:
            return "neutral", 0.8
    except Exception:
        return "neutral", 0.5
