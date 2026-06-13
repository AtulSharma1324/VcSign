import { Server, Socket } from "socket.io";

// ===========================
// Room Handler
// ===========================

// In-memory room state (backed by Redis in production via adapter)
const rooms = new Map<
  string,
  Map<string, { userId: string; displayName: string; avatarUrl: string | null; socketId: string }>
>();

export function setupRoomHandlers(io: Server, socket: Socket) {
  /** Join a video call room. */
  socket.on("room:join", async ({ roomId, userId }) => {
    const displayName = socket.data.displayName || `User-${userId.slice(0, 6)}`;
    const avatarUrl = socket.data.avatarUrl || null;

    // Add to Socket.IO room
    socket.join(roomId);
    socket.data.roomId = roomId;

    // Track participant
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    const room = rooms.get(roomId)!;
    room.set(userId, {
      userId,
      displayName,
      avatarUrl,
      socketId: socket.id,
    });

    // Send existing participants to the joiner
    const participants = Array.from(room.values())
      .filter((p) => p.userId !== userId)
      .map(({ userId, displayName, avatarUrl }) => ({
        userId,
        displayName,
        avatarUrl,
      }));

    socket.emit("room:joined", { roomId, participants });

    // Notify others that a new user joined
    socket.to(roomId).emit("user:joined", {
      userId,
      displayName,
      avatarUrl,
    });

    console.log(
      `[Room] ${displayName} joined ${roomId} (${room.size} participants)`
    );
  });

  /** Leave a room. */
  socket.on("room:leave", ({ roomId }) => {
    leaveRoom(io, socket, roomId);
  });

  /** Handle disconnect — auto-leave. */
  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      leaveRoom(io, socket, roomId);
    }
  });
}

function leaveRoom(io: Server, socket: Socket, roomId: string) {
  const userId = socket.data.userId;
  const room = rooms.get(roomId);

  if (room) {
    room.delete(userId);
    if (room.size === 0) {
      rooms.delete(roomId);
    }
  }

  socket.leave(roomId);
  socket.to(roomId).emit("user:left", { userId });

  console.log(`[Room] ${userId} left ${roomId}`);
}
