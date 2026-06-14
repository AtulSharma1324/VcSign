import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { setupRoomHandlers } from "./socketHandlers/roomHandler";
import { setupSignalingHandlers } from "./socketHandlers/signalingHandler";
import { setupChatHandlers } from "./socketHandlers/chatHandler";
import { setupCaptionHandlers } from "./socketHandlers/captionHandler";

dotenv.config({ path: "../../.env" });

// ===========================
// Signaling Server
// ===========================

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || process.env.SIGNALING_PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan("short"));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "signaling-server" });
});
app.get("/", (_req, res) => {
  res.send("Signaling Server OK");
});

// --- Socket.IO Setup ---
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 60000,
  maxHttpBufferSize: 1e7, // 10 MB for media data
});

// Redis adapter for multi-instance scalability
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisOptions = redisUrl.startsWith("rediss://") 
  ? { lazyConnect: true, tls: { rejectUnauthorized: false } } 
  : { lazyConnect: true };
const pubClient = new Redis(redisUrl, redisOptions);
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect().catch(() => {}), subClient.connect().catch(() => {})]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log("[Signaling] Redis adapter connected");
}).catch(() => {
  console.warn("[Signaling] Redis adapter failed, using in-memory");
});

// --- Auth middleware for Socket.IO ---
io.use((socket, next) => {
  const token = socket.handshake.auth.token as string;
  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const secret = process.env.JWT_ACCESS_SECRET || "dev-access-secret";
    const payload = jwt.verify(token, secret) as {
      userId: string;
      email: string;
    };
    socket.data.userId = payload.userId;
    socket.data.email = payload.email;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

// --- Socket Event Handlers ---
io.on("connection", (socket) => {
  console.log(`[Socket] Connected: ${socket.id} (user: ${socket.data.userId})`);

  setupRoomHandlers(io, socket);
  setupSignalingHandlers(io, socket);
  setupChatHandlers(io, socket);
  setupCaptionHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);
  });
});

// --- Start ---
httpServer.listen(PORT, () => {
  console.log(`[Signaling Server] Running on port ${PORT}`);
});

export { io };
export default app;
