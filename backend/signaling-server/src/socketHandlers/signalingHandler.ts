import { Server, Socket } from "socket.io";

// ===========================
// WebRTC Signaling Handler
// ===========================

export function setupSignalingHandlers(io: Server, socket: Socket) {
  /** Forward SDP offer to target peer. */
  socket.on("signal:offer", ({ sdp, targetUserId, roomId }) => {
    const targetSocket = findSocketByUserId(io, roomId, targetUserId);
    if (targetSocket) {
      targetSocket.emit("signal:offer", {
        sdp,
        fromUserId: socket.data.userId,
      });
    }
  });

  /** Forward SDP answer to target peer. */
  socket.on("signal:answer", ({ sdp, targetUserId, roomId }) => {
    const targetSocket = findSocketByUserId(io, roomId, targetUserId);
    if (targetSocket) {
      targetSocket.emit("signal:answer", {
        sdp,
        fromUserId: socket.data.userId,
      });
    }
  });

  /** Forward ICE candidate to target peer. */
  socket.on("signal:ice-candidate", ({ candidate, targetUserId, roomId }) => {
    const targetSocket = findSocketByUserId(io, roomId, targetUserId);
    if (targetSocket) {
      targetSocket.emit("signal:ice-candidate", {
        candidate,
        fromUserId: socket.data.userId,
      });
    }
  });
}

/** Find a socket by userId within a room. */
function findSocketByUserId(
  io: Server,
  roomId: string,
  userId: string
): Socket | undefined {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return undefined;

  for (const socketId of room) {
    const s = io.sockets.sockets.get(socketId);
    if (s && s.data.userId === userId) {
      return s;
    }
  }
  return undefined;
}
