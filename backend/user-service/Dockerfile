FROM node:20-alpine

WORKDIR /app

# Install shared dependencies
COPY shared/package.json shared/
RUN cd shared && npm install

# Install user-service dependencies
COPY user-service/package.json user-service/
RUN cd user-service && npm install

# Copy source code
COPY shared ./shared
COPY user-service ./user-service

WORKDIR /app/user-service
EXPOSE 4002

CMD ["npx", "tsx", "src/index.ts"]
