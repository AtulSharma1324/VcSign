# 🤟 SignLang VC — AI-Powered Sign Language Video Call Translator

A production-ready platform enabling seamless real-time communication between deaf/mute and hearing users during live video calls. The system translates sign language into text and speech, and converts speech into live captions — all with sub-500ms latency.

## ✨ Features

- **Real-time Sign Language Recognition** — AI detects hand gestures, facial expressions, and body movements using MediaPipe + LSTM
- **Live Video Calls** — WebRTC-powered 1:1 and group video calls with HD streaming
- **Instant Captions** — Translated text appears as live captions on the receiver's screen
- **AI Voice Generation** — Sign language is converted to natural speech in real time
- **Speech-to-Text** — Hearing user's speech is transcribed live using Whisper
- **Indian Sign Language (ISL)** — Primary support with extensible architecture for ASL and others
- **Accessibility** — Emergency mode, adjustable captions, dark mode, quick phrases
- **Meeting Summaries** — AI-generated notes after each call

## 🏗️ Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Node.js, Express.js, Socket.IO |
| AI Services | Python, FastAPI, MediaPipe, Faster-Whisper, Piper TTS |
| Video | WebRTC, Coturn (TURN/STUN) |
| Database | PostgreSQL 15 |
| Cache | Redis |
| Infrastructure | Docker, Kubernetes, AWS (EKS, RDS, S3) |

## 📁 Project Structure

```
├── frontend/          → Next.js web application
├── backend/
│   ├── shared/        → Shared utilities, DB, middleware
│   ├── signaling-server/  → WebRTC signaling (Socket.IO)
│   ├── auth-service/  → Authentication (JWT + OAuth)
│   ├── user-service/  → User profiles & preferences
│   ├── call-service/  → Call management & recording
│   └── chat-service/  → In-call messaging
├── ai-service/
│   ├── sign_recognition/  → Sign language → text
│   ├── speech_to_text/    → Speech → text (Whisper)
│   ├── text_to_speech/    → Text → speech (Piper)
│   └── nlp_engine/        → Grammar correction, prediction
├── infrastructure/
│   ├── docker/        → Docker Compose & Nginx
│   ├── kubernetes/    → K8s manifests
│   └── terraform/     → AWS IaC
└── docs/              → API & architecture docs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Using Docker (Recommended)
```bash
cp .env.example .env
docker compose up --build
```

### Manual Setup
```bash
# Install all dependencies
make setup

# Run database migrations
make db-migrate

# Start all services
make dev
```

The app will be available at `http://localhost:3000`

## 📖 Documentation

- [API Documentation](docs/api/)
- [Architecture Overview](docs/architecture/system-overview.md)
- [Deployment Guide](docs/deployment/)
- [AI Model Training](docs/ai/model-training.md)

## 📄 License

This project is proprietary software. All rights reserved.
