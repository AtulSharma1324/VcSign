import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";

// ===========================
// Chat Handler
// ===========================

export function setupChatHandlers(io: Server, socket: Socket) {
  /** Broadcast chat message to all participants in the room. */
  socket.on("chat:message", ({ content, callId, type }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const message = {
      id: uuidv4(),
      content,
      senderId: socket.data.userId,
      senderName: socket.data.displayName || "Unknown",
      type: type || "text",
      createdAt: new Date().toISOString(),
    };

    // Broadcast to all in room (including sender for confirmation)
    io.to(roomId).emit("chat:message", message);
  });
}
