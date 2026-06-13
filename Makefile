# ===========================
# AI Sign Language Video Call Translator
# ===========================

.PHONY: dev dev-frontend dev-backend dev-ai build test clean setup db-migrate db-seed

# --- Development ---
dev:
	docker compose up --build

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend/signaling-server && npm run dev & \
	cd backend/auth-service && npm run dev & \
	cd backend/user-service && npm run dev & \
	cd backend/call-service && npm run dev & \
	cd backend/chat-service && npm run dev

dev-ai:
	cd ai-service/sign_recognition && uvicorn app.main:app --reload --port 8000 & \
	cd ai-service/speech_to_text && uvicorn app.main:app --reload --port 8001 & \
	cd ai-service/text_to_speech && uvicorn app.main:app --reload --port 8002 & \
	cd ai-service/nlp_engine && uvicorn app.main:app --reload --port 8003

# --- Setup ---
setup: setup-frontend setup-backend setup-ai

setup-frontend:
	cd frontend && npm install

setup-backend:
	cd backend/shared && npm install
	cd backend/signaling-server && npm install
	cd backend/auth-service && npm install
	cd backend/user-service && npm install
	cd backend/call-service && npm install
	cd backend/chat-service && npm install

setup-ai:
	cd ai-service && python -m venv .venv
	cd ai-service && .venv/bin/pip install -r sign_recognition/requirements.txt
	cd ai-service && .venv/bin/pip install -r speech_to_text/requirements.txt
	cd ai-service && .venv/bin/pip install -r text_to_speech/requirements.txt
	cd ai-service && .venv/bin/pip install -r nlp_engine/requirements.txt

# --- Database ---
db-migrate:
	cd backend/shared && npx node-pg-migrate up

db-seed:
	cd backend/shared && node src/database/seeds/index.js

db-reset:
	cd backend/shared && npx node-pg-migrate down && npx node-pg-migrate up && node src/database/seeds/index.js

# --- Build ---
build:
	docker compose -f docker-compose.yml -f infrastructure/docker/docker-compose.prod.yml build

build-frontend:
	cd frontend && npm run build

# --- Test ---
test: test-frontend test-backend test-ai

test-frontend:
	cd frontend && npm test

test-backend:
	cd backend/auth-service && npm test
	cd backend/user-service && npm test
	cd backend/signaling-server && npm test
	cd backend/call-service && npm test
	cd backend/chat-service && npm test

test-ai:
	cd ai-service && pytest --cov=. --cov-report=html

test-e2e:
	cd frontend && npx playwright test

# --- Lint ---
lint:
	cd frontend && npm run lint
	cd backend/auth-service && npm run lint
	cd backend/user-service && npm run lint

# --- Clean ---
clean:
	docker compose down -v --remove-orphans
	rm -rf frontend/.next
	rm -rf frontend/node_modules
	find . -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
