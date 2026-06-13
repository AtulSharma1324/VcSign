"""
ISL Sign Language Model Training Pipeline
==========================================
Train a BiLSTM model on MediaPipe landmarks extracted from sign language video datasets.
"""

import os
import json
import argparse
import logging
from pathlib import Path
from datetime import datetime

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, random_split
from sklearn.metrics import classification_report, confusion_matrix

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---- Dataset ----
class LandmarkDataset(Dataset):
    """Dataset of MediaPipe landmark sequences with sign labels."""

    def __init__(self, data_dir: str, sequence_length: int = 30):
        self.sequence_length = sequence_length
        self.samples: list[tuple[np.ndarray, int]] = []
        self.labels: list[str] = []

        data_path = Path(data_dir)
        vocab_path = data_path / "vocabulary.json"

        if vocab_path.exists():
            with open(vocab_path, "r") as f:
                vocab = json.load(f)
                self.labels = vocab["labels"]
        else:
            # Auto-discover labels from subdirectories
            self.labels = sorted(
                [d.name for d in data_path.iterdir() if d.is_dir()]
            )
            logger.info(f"Auto-discovered {len(self.labels)} labels")

        label_to_idx = {label: idx for idx, label in enumerate(self.labels)}

        # Load sequences
        for label in self.labels:
            label_dir = data_path / label
            if not label_dir.is_dir():
                continue

            idx = label_to_idx[label]

            for npy_file in label_dir.glob("*.npy"):
                landmarks = np.load(npy_file)

                # Pad or trim to sequence_length
                if len(landmarks) < sequence_length:
                    pad = np.zeros(
                        (sequence_length - len(landmarks), landmarks.shape[1]),
                        dtype=np.float32,
                    )
                    landmarks = np.vstack([landmarks, pad])
                elif len(landmarks) > sequence_length:
                    landmarks = landmarks[:sequence_length]

                self.samples.append((landmarks.astype(np.float32), idx))

        logger.info(
            f"Loaded {len(self.samples)} samples across {len(self.labels)} classes"
        )

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        landmarks, label = self.samples[idx]
        return torch.tensor(landmarks), torch.tensor(label, dtype=torch.long)


# ---- Model (same as gesture_classifier.py) ----
class BiLSTMClassifier(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes, num_layers=2):
        super().__init__()
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

    def forward(self, x):
        batch_size, seq_len, features = x.shape
        x = x.reshape(-1, features)
        x = self.batch_norm(x)
        x = x.reshape(batch_size, seq_len, features)
        lstm_out, _ = self.lstm(x)
        out = lstm_out[:, -1, :]
        out = self.fc(out)
        return out


# ---- Training Loop ----
def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Training on: {device}")

    # Load dataset
    dataset = LandmarkDataset(args.data_dir, args.sequence_length)

    if len(dataset) == 0:
        logger.error("No data found. Check --data-dir.")
        return

    # Split into train/val
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_set, val_set = random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_set, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_set, batch_size=args.batch_size)

    # Model
    num_classes = len(dataset.labels)
    input_size = dataset.samples[0][0].shape[1] if dataset.samples else 1629

    model = BiLSTMClassifier(
        input_size=input_size,
        hidden_size=args.hidden_size,
        num_classes=num_classes,
        num_layers=args.num_layers,
    ).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr, weight_decay=1e-5)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode="min", factor=0.5, patience=5
    )

    # Training
    best_val_loss = float("inf")
    patience_counter = 0

    for epoch in range(args.epochs):
        model.train()
        train_loss = 0.0
        correct = 0
        total = 0

        for landmarks, labels in train_loader:
            landmarks, labels = landmarks.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(landmarks)
            loss = criterion(outputs, labels)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            train_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

        train_acc = correct / total if total > 0 else 0
        avg_train_loss = train_loss / len(train_loader)

        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for landmarks, labels in val_loader:
                landmarks, labels = landmarks.to(device), labels.to(device)
                outputs = model(landmarks)
                loss = criterion(outputs, labels)
                val_loss += loss.item()
                _, predicted = torch.max(outputs, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()

        val_acc = val_correct / val_total if val_total > 0 else 0
        avg_val_loss = val_loss / max(len(val_loader), 1)

        scheduler.step(avg_val_loss)

        logger.info(
            f"Epoch {epoch+1}/{args.epochs} | "
            f"Train Loss: {avg_train_loss:.4f} Acc: {train_acc:.4f} | "
            f"Val Loss: {avg_val_loss:.4f} Acc: {val_acc:.4f}"
        )

        # Early stopping
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            patience_counter = 0

            # Save best model
            save_path = Path(args.output_dir) / f"isl_lstm_{args.version}.pt"
            save_path.parent.mkdir(parents=True, exist_ok=True)
            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "optimizer_state_dict": optimizer.state_dict(),
                    "epoch": epoch,
                    "val_loss": best_val_loss,
                    "val_acc": val_acc,
                    "num_classes": num_classes,
                    "input_size": input_size,
                    "labels": dataset.labels,
                    "trained_at": datetime.now().isoformat(),
                },
                save_path,
            )
            logger.info(f"Model saved to {save_path}")
        else:
            patience_counter += 1
            if patience_counter >= args.patience:
                logger.info(f"Early stopping at epoch {epoch+1}")
                break

    # Save vocabulary
    vocab_path = Path(args.output_dir) / "isl_vocabulary.json"
    with open(vocab_path, "w") as f:
        json.dump({"labels": dataset.labels, "version": args.version}, f, indent=2)
    logger.info(f"Vocabulary saved to {vocab_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ISL Sign Language Model")
    parser.add_argument("--data-dir", type=str, required=True, help="Path to landmark data")
    parser.add_argument("--output-dir", type=str, default="./weights", help="Output directory")
    parser.add_argument("--version", type=str, default="v1", help="Model version tag")
    parser.add_argument("--epochs", type=int, default=100, help="Max training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--hidden-size", type=int, default=256, help="LSTM hidden size")
    parser.add_argument("--num-layers", type=int, default=2, help="LSTM layers")
    parser.add_argument("--sequence-length", type=int, default=30, help="Frames per sequence")
    parser.add_argument("--patience", type=int, default=15, help="Early stopping patience")
    args = parser.parse_args()

    train(args)
