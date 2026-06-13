FROM node:20-alpine

WORKDIR /app

# Install shared dependencies
COPY backend/shared/package.json shared/
RUN cd shared && npm install

# Install auth-service dependencies
COPY backend/auth-service/package.json auth-service/
RUN cd auth-service && npm install

# Copy source code
COPY backend/shared ./shared
COPY backend/auth-service ./auth-service

WORKDIR /app/auth-service
EXPOSE 4001

CMD ["npx", "tsx", "src/index.ts"]
