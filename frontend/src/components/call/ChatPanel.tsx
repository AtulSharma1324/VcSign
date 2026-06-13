"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Smile } from "lucide-react";
import { clsx } from "clsx";
import { Avatar } from "@/components/ui/Avatar";

// ===========================
// ChatPanel Component
// ===========================

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  type: "text" | "emoji" | "system";
  createdAt: string;
  isLocal?: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
}

export function ChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserId,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 z-40 flex flex-col glass border-l border-[var(--border)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <h3 className="font-semibold text-sm">In-Call Chat</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.length === 0 && (
              <div className="text-center text-sm text-[var(--muted-foreground)] mt-8">
                <p>No messages yet.</p>
                <p className="text-xs mt-1">Send a message to get started!</p>
              </div>
            )}

            {messages.map((msg) => {
              const isLocal = msg.senderId === currentUserId;

              if (msg.type === "system") {
                return (
                  <div
                    key={msg.id}
                    className="text-center text-xs text-[var(--muted-foreground)] py-1"
                  >
                    {msg.content}
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={clsx(
                    "flex gap-2",
                    isLocal ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {!isLocal && (
                    <Avatar name={msg.senderName} size="xs" />
                  )}
                  <div
                    className={clsx(
                      "max-w-[75%] rounded-2xl px-3 py-2",
                      isLocal
                        ? "bg-[var(--color-primary-500)] text-white rounded-tr-sm"
                        : "bg-[var(--muted)] rounded-tl-sm"
                    )}
                  >
                    {!isLocal && (
                      <p className="text-[10px] font-medium text-[var(--muted-foreground)] mb-0.5">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed break-words">
                      {msg.content}
                    </p>
                    <p
                      className={clsx(
                        "text-[10px] mt-1",
                        isLocal ? "text-white/60" : "text-[var(--muted-foreground)]"
                      )}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="input-field flex-1 text-sm py-2"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={clsx(
                  "p-2.5 rounded-xl transition-all",
                  input.trim()
                    ? "bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] shadow-md"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                )}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
