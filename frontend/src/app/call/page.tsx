"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Video, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CallLobbyPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartNewCall = () => {
    setIsStarting(true);
    const newRoomId = crypto.randomUUID();
    router.push(`/call/${newRoomId}`);
  };

  const handleJoinCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    
    setIsJoining(true);
    // Strip any full URLs if the user pasted a link, just grab the ID
    const code = roomCode.split("/").pop()?.trim();
    router.push(`/call/${code}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-md shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)]" />
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] flex items-center justify-center mx-auto mb-4">
            <Video size={32} />
          </div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-2">
            Video Call Lobby
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Start a new AI-translated call or join an existing one.
          </p>
        </div>

        <div className="space-y-6">
          <Button 
            className="w-full py-6 text-lg" 
            onClick={handleStartNewCall}
            isLoading={isStarting}
          >
            <Video className="mr-2" size={20} />
            Start New Call
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[var(--background)] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">
                or join existing
              </span>
            </div>
          </div>

          <form onSubmit={handleJoinCall} className="space-y-4">
            <Input
              label="Room Code or Link"
              placeholder="e.g. 123e4567-e89b..."
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              leftIcon={<Users size={18} />}
            />
            <Button 
              type="submit" 
              variant="secondary" 
              className="w-full"
              disabled={!roomCode.trim()}
              isLoading={isJoining}
            >
              Join Call
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
