import { create } from "zustand";

// ===========================
// Call Store (Zustand)
// ===========================

interface PeerState {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  isMuted: boolean;
  isVideoOn: boolean;
  stream: MediaStream | null;
}

interface CallStore {
  // State
  isInCall: boolean;
  roomId: string | null;
  callId: string | null;
  localStream: MediaStream | null;
  peers: Map<string, PeerState>;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  callStartTime: number | null;

  // Actions
  setCallActive: (roomId: string, callId: string) => void;
  endCall: () => void;
  setLocalStream: (stream: MediaStream | null) => void;
  addPeer: (peer: PeerState) => void;
  removePeer: (userId: string) => void;
  updatePeerStream: (userId: string, stream: MediaStream) => void;
  updatePeerMedia: (
    userId: string,
    updates: Partial<Pick<PeerState, "isMuted" | "isVideoOn">>
  ) => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  toggleRecording: () => void;
}

export const useCallStore = create<CallStore>((set, get) => ({
  isInCall: false,
  roomId: null,
  callId: null,
  localStream: null,
  peers: new Map(),
  isMuted: false,
  isVideoOn: true,
  isScreenSharing: false,
  isRecording: false,
  callStartTime: null,

  setCallActive: (roomId, callId) =>
    set({
      isInCall: true,
      roomId,
      callId,
      callStartTime: Date.now(),
    }),

  endCall: () => {
    const { localStream, peers } = get();

    // Stop all local tracks
    localStream?.getTracks().forEach((track) => track.stop());

    // Stop all peer streams
    peers.forEach((peer) => {
      peer.stream?.getTracks().forEach((track) => track.stop());
    });

    set({
      isInCall: false,
      roomId: null,
      callId: null,
      localStream: null,
      peers: new Map(),
      isMuted: false,
      isVideoOn: true,
      isScreenSharing: false,
      isRecording: false,
      callStartTime: null,
    });
  },

  setLocalStream: (stream) => set({ localStream: stream }),

  addPeer: (peer) =>
    set((state) => {
      const newPeers = new Map(state.peers);
      newPeers.set(peer.userId, peer);
      return { peers: newPeers };
    }),

  removePeer: (userId) =>
    set((state) => {
      const newPeers = new Map(state.peers);
      const peer = newPeers.get(userId);
      peer?.stream?.getTracks().forEach((track) => track.stop());
      newPeers.delete(userId);
      return { peers: newPeers };
    }),

  updatePeerStream: (userId, stream) =>
    set((state) => {
      const newPeers = new Map(state.peers);
      const peer = newPeers.get(userId);
      if (peer) {
        newPeers.set(userId, { ...peer, stream });
      }
      return { peers: newPeers };
    }),

  updatePeerMedia: (userId, updates) =>
    set((state) => {
      const newPeers = new Map(state.peers);
      const peer = newPeers.get(userId);
      if (peer) {
        newPeers.set(userId, { ...peer, ...updates });
      }
      return { peers: newPeers };
    }),

  toggleMute: () =>
    set((state) => {
      const newMuted = !state.isMuted;
      state.localStream?.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
      return { isMuted: newMuted };
    }),

  toggleVideo: () =>
    set((state) => {
      const newVideoOff = !state.isVideoOn;
      state.localStream?.getVideoTracks().forEach((track) => {
        track.enabled = newVideoOff;
      });
      return { isVideoOn: newVideoOff };
    }),

  toggleScreenShare: () =>
    set((state) => ({ isScreenSharing: !state.isScreenSharing })),

  toggleRecording: () =>
    set((state) => ({ isRecording: !state.isRecording })),
}));
