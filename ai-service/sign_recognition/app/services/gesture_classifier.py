"""
Gesture Classifier
==================
LSTM-based classifier that processes sequences of MediaPipe landmarks to identify signs.
"""

import numpy as np
import torch
import torch.nn as nn
from typing import Optional, Tuple
from collections import deque

from app.services.model_manager import ModelManager


class BiLSTMClassifier(nn.Module):
    """Bidirectional LSTM for temporal gesture classification."""

    def __init__(self, input_size: int, hidden_size: int, num_classes: int, num_layers: int = 2):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        self.batch_norm = nn.BatchNorm1d(input_size)
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=0.3,
        )
        self.fc = nn.Sequential(
            nn.Linear(hidden_size * 2, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch, seq_len, features)
        batch_size, seq_len, features = x.shape

        # Normalize across features
        x = x.reshape(-1, features)
        x = self.batch_norm(x)
        x = x.reshape(batch_size, seq_len, features)

        # LSTM
        lstm_out, _ = self.lstm(x)

        # Use the last time step output
        out = lstm_out[:, -1, :]

        # Classify
        out = self.fc(out)
        return out


class GestureClassifier:
    """Wraps the LSTM model for real-time inference on landmark sequences."""

    SEQUENCE_LENGTH = 30  # frames per sequence
    OVERLAP = 15          # frame overlap
    TOTAL_LANDMARKS = 543  # 33 pose + 468 face + 21*2 hands
    COORDS_PER_LANDMARK = 3
    INPUT_SIZE = TOTAL_LANDMARKS * COORDS_PER_LANDMARK  # 1629

    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.frame_buffer: deque = deque(maxlen=self.SEQUENCE_LENGTH)
        self.frame_count = 0
        self.confidence_threshold = 0.6

        # Load model
        self.model = self._load_model()
        self.model.eval()

    def _load_model(self) -> BiLSTMClassifier:
        """Load the pre-trained LSTM model."""
        model = BiLSTMClassifier(
            input_size=self.INPUT_SIZE,
            hidden_size=256,
            num_classes=self.model_manager.vocab_size,
            num_layers=2,
        )

        model_path = self.model_manager.model_path
        if model_path and model_path.exists():
            checkpoint = torch.load(model_path, map_location="cpu", weights_only=True)
            model.load_state_dict(checkpoint["model_state_dict"])
            print(f"[GestureClassifier] Loaded model from {model_path}")
        else:
            print("[GestureClassifier] No pre-trained model found, using random weights")

        return model

    def _normalize_landmarks(self, landmarks: list) -> np.ndarray:
        """
        Normalize landmark coordinates relative to the wrist position.
        This makes the model invariant to hand position in the frame.
        """
        arr = np.array(landmarks, dtype=np.float32).flatten()

        if len(arr) < self.INPUT_SIZE:
            # Pad with zeros if fewer landmarks than expected
            arr = np.pad(arr, (0, self.INPUT_SIZE - len(arr)))
        elif len(arr) > self.INPUT_SIZE:
            arr = arr[: self.INPUT_SIZE]

        # Normalize relative to the first wrist landmark (index 0)
        if len(arr) >= 3:
            wrist = arr[:3].copy()
            for i in range(0, len(arr), 3):
                arr[i] -= wrist[0]
                arr[i + 1] -= wrist[1]
                arr[i + 2] -= wrist[2]

        return arr

    def classify(
        self, landmarks: list, timestamp: int
    ) -> Optional[Tuple[str, float]]:
        """
        Add a frame of landmarks to the buffer.
        When enough frames are collected, run inference.

        Returns (sign_label, confidence) or None if not enough frames yet.
        """
        normalized = self._normalize_landmarks(landmarks)
        self.frame_buffer.append(normalized)
        self.frame_count += 1

        # Only classify when we have a full sequence
        if len(self.frame_buffer) < self.SEQUENCE_LENGTH:
            return None

        # Run inference every OVERLAP frames
        if self.frame_count % self.OVERLAP != 0:
            return None

        # Prepare input tensor
        sequence = np.array(list(self.frame_buffer), dtype=np.float32)
        tensor = torch.tensor(sequence).unsqueeze(0)  # (1, seq_len, features)

        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=-1)
            confidence, predicted = torch.max(probs, dim=-1)

        conf = confidence.item()
        pred_idx = predicted.item()

        if conf < self.confidence_threshold:
            return None

        sign_label = self.model_manager.idx_to_label(pred_idx)
        return sign_label, conf
