import { Server, Socket } from "socket.io";

// ===========================
// Caption Handler
// ===========================

export function setupCaptionHandlers(io: Server, socket: Socket) {
  /** Broadcast a caption (from sign recognition or speech-to-text) to the room. */
  socket.on("caption:send", ({ text, source, confidence, roomId }) => {
    const targetRoom = roomId || socket.data.roomId;
    if (!targetRoom) return;

    // Broadcast to all OTHER participants (not the sender)
    socket.to(targetRoom).emit("caption:new", {
      text,
      userId: socket.data.userId,
      displayName: socket.data.displayName || "Unknown",
      source,
      confidence,
      timestamp: Date.now(),
    });
  });

  /** Forward media state changes. */
  socket.on("user:mute-toggle", ({ roomId, isMuted }) => {
    socket.to(roomId).emit("user:mute-changed", {
      userId: socket.data.userId,
      isMuted,
    });
  });

  socket.on("user:video-toggle", ({ roomId, isVideoOn }) => {
    socket.to(roomId).emit("user:video-changed", {
      userId: socket.data.userId,
      isVideoOn,
    });
  });
}
