import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/socket-events";
import { SIGNALING_URL } from "@/lib/constants";
import { useAuthStore } from "@/stores/authStore";

// ===========================
// Socket.IO Client Singleton
// ===========================

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

/** Get or create the Socket.IO connection. */
export function getSocket(): AppSocket {
  if (!socket) {
    const token = useAuthStore.getState().accessToken;

    socket = io(SIGNALING_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socket.on("error", (data) => {
      console.error("[Socket] Server error:", data.message, data.code);
    });
  }

  return socket;
}

/** Connect the socket (call after authentication). */
export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    const token = useAuthStore.getState().accessToken;
    s.auth = { token };
    s.connect();
  }
}

/** Disconnect and clean up. */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/** Update auth token on the socket (after token refresh). */
export function updateSocketAuth(token: string): void {
  if (socket) {
    socket.auth = { token };
  }
}
