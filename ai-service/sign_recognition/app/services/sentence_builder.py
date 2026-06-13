"""
Sentence Builder
================
Accumulates individual sign tokens into coherent sentences.
Handles deduplication, timing gaps, and partial sentence tracking.
"""

import time
from collections import deque
from typing import Optional


class SentenceBuilder:
    """Builds sentences from a stream of recognized sign tokens."""

    def __init__(
        self,
        max_gap_seconds: float = 2.0,
        duplicate_window: int = 3,
        min_confidence: float = 0.6,
    ):
        self.max_gap_seconds = max_gap_seconds
        self.duplicate_window = duplicate_window
        self.min_confidence = min_confidence

        self.current_tokens: list[str] = []
        self.recent_signs: deque[str] = deque(maxlen=duplicate_window)
        self.last_sign_time: float = 0.0
        self.is_partial: bool = True
        self.completed_sentences: list[str] = []

    def add_sign(self, sign: str, confidence: float) -> str:
        """
        Add a recognized sign token.
        Returns the current (partial or complete) sentence.
        """
        now = time.time()

        # Skip low-confidence signs
        if confidence < self.min_confidence:
            return self._get_sentence()

        # Check for time gap → finalize current sentence
        if self.last_sign_time > 0 and (now - self.last_sign_time) > self.max_gap_seconds:
            self._finalize_sentence()

        # Skip duplicate consecutive signs
        if sign in self.recent_signs:
            return self._get_sentence()

        # Add sign
        self.current_tokens.append(sign)
        self.recent_signs.append(sign)
        self.last_sign_time = now
        self.is_partial = True

        return self._get_sentence()

    def _finalize_sentence(self):
        """Mark the current sentence as complete and start a new one."""
        if self.current_tokens:
            sentence = self._format_sentence(self.current_tokens)
            self.completed_sentences.append(sentence)
            self.current_tokens = []
            self.recent_signs.clear()
            self.is_partial = False

    def _get_sentence(self) -> str:
        """Get the current sentence being built."""
        if not self.current_tokens:
            if self.completed_sentences:
                return self.completed_sentences[-1]
            return ""
        return self._format_sentence(self.current_tokens)

    def _format_sentence(self, tokens: list[str]) -> str:
        """
        Convert sign tokens into a readable sentence.
        Sign language grammar differs from spoken language, so this does
        basic formatting. The NLP engine handles full grammar correction.
        """
        if not tokens:
            return ""

        # Join tokens with spaces
        sentence = " ".join(token.replace("_", " ") for token in tokens)

        # Basic capitalization
        sentence = sentence.capitalize()

        # Add period if sentence seems complete (3+ tokens)
        if len(tokens) >= 3 and not sentence.endswith((".", "?", "!")):
            sentence += "."

        return sentence

    def reset(self):
        """Clear all state."""
        self.current_tokens = []
        self.recent_signs.clear()
        self.last_sign_time = 0.0
        self.is_partial = True
        self.completed_sentences = []
