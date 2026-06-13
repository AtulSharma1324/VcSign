"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Video, Settings, LogOut, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated && mounted) {
      router.push("/login");
    }
  }, [isAuthenticated, router, mounted]);

  if (!mounted || !isAuthenticated || !user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top Navigation */}
      <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--color-primary-500)] to-[var(--color-secondary-500)] flex items-center justify-center">
              <span className="text-white font-bold font-[family-name:var(--font-display)]">S</span>
            </div>
            <span className="font-bold text-lg hidden sm:block font-[family-name:var(--font-display)]">
              SignLang VC
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium hidden sm:block">
              {user.displayName}
            </span>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-[var(--border)] transition-colors text-[var(--muted-foreground)] hover:text-red-500"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-2">
            Welcome back, {user.displayName.split(' ')[0]}! 👋
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Ready to break some communication barriers today?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Action Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-sm hover:border-[var(--color-primary-500)] transition-colors group cursor-pointer"
            onClick={() => router.push("/call")}
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Video size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Start Video Call</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Launch a new AI-translated video call session instantly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-sm hover:border-[var(--color-secondary-500)] transition-colors group cursor-pointer"
            onClick={() => router.push("/practice")}
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-secondary-500)]/10 text-[var(--color-secondary-500)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Practice Mode (Demo)</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Test the AI instantly! Sign to text, and text to speech.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-sm hover:border-[var(--foreground)] transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--border)] text-[var(--foreground)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Settings size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Preferences</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Customize caption sizes, themes, and AI settings. (Coming soon)
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
