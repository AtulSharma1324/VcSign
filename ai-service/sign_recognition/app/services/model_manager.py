"""
Model Manager
=============
Manages sign language model loading, version control, and vocabulary mapping.
"""

import os
import json
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class ModelManager:
    """Manages ML model lifecycle — loading, versioning, and label mapping."""

    def __init__(self):
        self.language = os.getenv("SIGN_LANGUAGE", "ISL")
        self.version = os.getenv("SIGN_MODEL_VERSION", "v1")
        self.model_dir = Path(__file__).parent.parent.parent / "weights"
        self.model_path = self._resolve_model_path()
        self.labels: list[str] = []
        self.label_to_idx: dict[str, int] = {}
        self._load_vocabulary()

    def _resolve_model_path(self) -> Optional[Path]:
        """Find the model weights file."""
        model_file = os.getenv(
            "SIGN_MODEL_PATH",
            f"isl_lstm_{self.version}.pt",
        )
        full_path = self.model_dir / model_file
        if full_path.exists():
            return full_path

        # Fallback: check for any .pt file
        pt_files = list(self.model_dir.glob("*.pt"))
        if pt_files:
            return pt_files[0]

        return None

    def _load_vocabulary(self):
        """Load the sign vocabulary (label mapping) from JSON."""
        vocab_path = self.model_dir / f"{self.language.lower()}_vocabulary.json"

        if vocab_path.exists():
            with open(vocab_path, "r") as f:
                vocab = json.load(f)
                self.labels = vocab.get("labels", [])
                self.label_to_idx = {
                    label: idx for idx, label in enumerate(self.labels)
                }
            print(f"[ModelManager] Loaded vocabulary: {len(self.labels)} signs")
        else:
            # Default ISL vocabulary (common signs for initial development)
            self.labels = [
                "hello", "goodbye", "thank_you", "please", "sorry",
                "yes", "no", "help", "stop", "go",
                "eat", "drink", "water", "food", "medicine",
                "pain", "hospital", "doctor", "family", "friend",
                "love", "happy", "sad", "angry", "scared",
                "morning", "evening", "today", "tomorrow", "yesterday",
                "name", "what", "where", "when", "how",
                "I", "you", "he", "she", "we",
                "good", "bad", "big", "small", "more",
                "home", "school", "work", "money", "phone",
            ]
            self.label_to_idx = {
                label: idx for idx, label in enumerate(self.labels)
            }
            print(
                f"[ModelManager] Using default vocabulary: {len(self.labels)} signs"
            )

    @property
    def vocab_size(self) -> int:
        return len(self.labels)

    @property
    def sequence_length(self) -> int:
        return 30

    def idx_to_label(self, idx: int) -> str:
        """Convert model output index to sign label."""
        if 0 <= idx < len(self.labels):
            return self.labels[idx]
        return "unknown"

    def label_to_index(self, label: str) -> int:
        """Convert sign label to model input index."""
        return self.label_to_idx.get(label, -1)
