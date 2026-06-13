// ===========================
// Chat Message Types
// ===========================

export interface Message {
  id: string;
  callId: string;
  senderId: string;
  content: string;
  messageType: "text" | "emoji" | "file" | "system";
  fileUrl: string | null;
  isRead: boolean;
  createdAt: string;
  sender?: {
    displayName: string;
    avatarUrl: string | null;
  };
}
