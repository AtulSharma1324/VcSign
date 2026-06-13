import { ICE_SERVERS } from "@/lib/constants";

// ===========================
// WebRTC Peer Connection Manager
// ===========================

export interface PeerConnectionConfig {
  userId: string;
  onTrack: (stream: MediaStream, userId: string) => void;
  onIceCandidate: (candidate: RTCIceCandidate, userId: string) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState, userId: string) => void;
}

export class WebRTCManager {
  private peers: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private pendingCandidates: Map<string, RTCIceCandidateInit[]> = new Map();

  /** Set the local media stream to attach to all peer connections. */
  setLocalStream(stream: MediaStream) {
    this.localStream = stream;
  }

  /** Create a new peer connection for a given remote user. */
  createPeerConnection(config: PeerConnectionConfig): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 10,
    });

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        config.onTrack(stream, config.userId);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        config.onIceCandidate(event.candidate, config.userId);
      }
    };

    // Monitor connection state
    pc.onconnectionstatechange = () => {
      config.onConnectionStateChange(pc.connectionState, config.userId);

      if (pc.connectionState === "failed") {
        console.warn(`[WebRTC] Connection failed for ${config.userId}, restarting ICE`);
        pc.restartIce();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(
        `[WebRTC] ICE state for ${config.userId}: ${pc.iceConnectionState}`
      );
    };

    this.peers.set(config.userId, pc);

    // Flush any buffered ICE candidates
    const buffered = this.pendingCandidates.get(config.userId);
    if (buffered) {
      buffered.forEach((candidate) => {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      });
      this.pendingCandidates.delete(config.userId);
    }

    return pc;
  }

  /** Create an SDP offer for a remote user. */
  async createOffer(userId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this.peers.get(userId);
    if (!pc) throw new Error(`No peer connection for ${userId}`);

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await pc.setLocalDescription(offer);
    return offer;
  }

  /** Handle an incoming SDP offer and return an answer. */
  async handleOffer(
    userId: string,
    offer: RTCSessionDescriptionInit,
    config: PeerConnectionConfig
  ): Promise<RTCSessionDescriptionInit> {
    let pc = this.peers.get(userId);
    if (!pc) {
      pc = this.createPeerConnection(config);
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  /** Handle an incoming SDP answer. */
  async handleAnswer(
    userId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const pc = this.peers.get(userId);
    if (!pc) {
      console.warn(`[WebRTC] No peer connection for answer from ${userId}`);
      return;
    }
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  /** Add a received ICE candidate. Buffers if peer connection isn't ready. */
  async addIceCandidate(
    userId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const pc = this.peers.get(userId);
    if (!pc || !pc.remoteDescription) {
      // Buffer until remote description is set
      if (!this.pendingCandidates.has(userId)) {
        this.pendingCandidates.set(userId, []);
      }
      this.pendingCandidates.get(userId)!.push(candidate);
      return;
    }
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  /** Remove a peer connection. */
  removePeer(userId: string): void {
    const pc = this.peers.get(userId);
    if (pc) {
      pc.close();
      this.peers.delete(userId);
    }
    this.pendingCandidates.delete(userId);
  }

  /** Replace a track (e.g., for screen sharing). */
  async replaceTrack(
    kind: "video" | "audio",
    newTrack: MediaStreamTrack
  ): Promise<void> {
    for (const [, pc] of this.peers) {
      const sender = pc.getSenders().find((s) => s.track?.kind === kind);
      if (sender) {
        await sender.replaceTrack(newTrack);
      }
    }
  }

  /** Destroy all connections. */
  destroy(): void {
    this.peers.forEach((pc) => pc.close());
    this.peers.clear();
    this.pendingCandidates.clear();
    this.localStream = null;
  }

  /** Get a peer connection by user ID. */
  getPeer(userId: string): RTCPeerConnection | undefined {
    return this.peers.get(userId);
  }

  /** Get all peer user IDs. */
  getPeerIds(): string[] {
    return Array.from(this.peers.keys());
  }
}
