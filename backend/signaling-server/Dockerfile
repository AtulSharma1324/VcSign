FROM node:20-alpine

WORKDIR /app

# Install shared dependencies
COPY backend/shared/package.json shared/
RUN cd shared && npm install

# Install signaling-server dependencies
COPY backend/signaling-server/package.json signaling-server/
RUN cd signaling-server && npm install

# Copy source code
COPY backend/shared ./shared
COPY backend/signaling-server ./signaling-server

WORKDIR /app/signaling-server
EXPOSE 4000

CMD ["npx", "tsx", "src/index.ts"]
