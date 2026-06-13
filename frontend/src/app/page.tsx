"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Video,
  Hand,
  MessageSquareText,
  Volume2,
  Shield,
  Zap,
  Globe,
  Heart,
  ChevronRight,
  ArrowRight,
  Mic,
  Eye,
  Brain,
  Sparkles,
  Users,
  Clock,
  Languages,
  Accessibility,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// ===========================
// Landing Page
// ===========================

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-[var(--color-primary-500)] rounded-full blur-[128px] opacity-20 animate-[pulse-soft_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-[var(--color-accent-500)] rounded-full blur-[128px] opacity-15 animate-[pulse-soft_5s_ease-in-out_infinite_1s]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)] border border-[var(--color-primary-500)]/20 mb-6">
                <Sparkles size={14} />
                AI-Powered Communication
                <ChevronRight size={14} />
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold font-[family-name:var(--font-display)] tracking-tight text-balance leading-[1.1]"
            >
              Break Every{" "}
              <span className="gradient-text">Communication</span>{" "}
              Barrier
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-lg sm:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto text-balance"
            >
              Real-time AI sign language translation during live video calls.
              Enabling seamless conversations between deaf and hearing users
              with sub-500ms latency.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                  Start Free Video Call
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="secondary" size="lg">
                  See How It Works
                </Button>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {[
                { value: "<500ms", label: "Caption Delay" },
                { value: "95%+", label: "Accuracy" },
                { value: "ISL", label: "Sign Language" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero visual — Video call mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden video-shadow border border-[var(--border)]">
              <div className="aspect-video bg-gradient-to-br from-[var(--color-surface-800)] to-[var(--color-surface-900)] flex items-center justify-center relative">
                {/* Mock video call UI */}
                <div className="grid grid-cols-2 gap-3 p-4 w-full h-full">
                  {/* User A — Deaf user */}
                  <div className="relative bg-gradient-to-br from-[var(--color-surface-700)] to-[var(--color-surface-800)] rounded-xl flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mx-auto mb-3">
                        <Hand size={36} className="text-white" />
                      </div>
                      <p className="text-white/80 text-sm font-medium">User A (Signing)</p>
                    </div>
                    {/* Hand tracking dots */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-accent-500)] animate-pulse" />
                      <span className="text-xs text-[var(--color-accent-400)] font-medium">
                        AI Tracking Active
                      </span>
                    </div>
                    {/* Caption on User A&rsquo;s side */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                        <p className="text-xs text-[var(--color-accent-400)] mb-0.5">
                          User B said:
                        </p>
                        <p className="text-white text-sm font-medium">
                          &quot;How are you feeling today?&quot;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User B — Hearing user */}
                  <div className="relative bg-gradient-to-br from-[var(--color-surface-700)] to-[var(--color-surface-800)] rounded-xl flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-3">
                        <Mic size={36} className="text-white" />
                      </div>
                      <p className="text-white/80 text-sm font-medium">User B (Speaking)</p>
                    </div>
                    <div className="absolute top-4 left-4 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs text-blue-400 font-medium">
                        Speech Recognition
                      </span>
                    </div>
                    {/* Caption + audio on User B&rsquo;s side */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                        <p className="text-xs text-indigo-400 mb-0.5">
                          User A signed:
                        </p>
                        <p className="text-white text-sm font-medium">
                          &quot;I am doing great, thank you!&quot;
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Volume2 size={12} className="text-[var(--color-accent-400)]" />
                          <span className="text-[10px] text-[var(--color-accent-400)]">
                            Playing AI voice
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom call controls bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-center gap-3">
                    {[
                      { icon: Mic, label: "Mic", active: true },
                      { icon: Video, label: "Video", active: true },
                      { icon: MessageSquareText, label: "Captions", active: true },
                    ].map((ctrl) => (
                      <div
                        key={ctrl.label}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          ctrl.active
                            ? "bg-white/15 text-white"
                            : "bg-white/5 text-white/40"
                        }`}
                      >
                        <ctrl.icon size={18} />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 text-white">
                      <span className="text-xs font-bold">✕</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="badge badge-primary mb-4"
            >
              Core Features
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] tracking-tight"
            >
              Everything You Need for{" "}
              <span className="gradient-text">Inclusive Calls</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto"
            >
              A complete suite of AI-powered tools that make video communication
              accessible to everyone.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Hand,
                title: "Sign Language Recognition",
                description:
                  "Real-time ISL detection using MediaPipe hand tracking and deep learning. Recognizes gestures, expressions, and body movements.",
                color: "from-violet-500 to-purple-600",
              },
              {
                icon: MessageSquareText,
                title: "Live Captions",
                description:
                  "Instant text captions with adjustable size, position, and styling. Multi-speaker differentiation with color coding.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Volume2,
                title: "AI Voice Synthesis",
                description:
                  "Convert translated sign language into natural-sounding speech using Piper TTS with multiple voice options.",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: Mic,
                title: "Speech-to-Text",
                description:
                  "Whisper-powered transcription converts spoken words into live text captions for deaf users in real time.",
                color: "from-amber-500 to-orange-500",
              },
              {
                icon: Video,
                title: "HD Video Calls",
                description:
                  "WebRTC-powered peer-to-peer video with screen sharing, recording, and group call support for up to 8 users.",
                color: "from-rose-500 to-pink-500",
              },
              {
                icon: Brain,
                title: "Smart AI Engine",
                description:
                  "Context-aware grammar correction, sentence prediction, emotion detection, and meeting summarization.",
                color: "from-indigo-500 to-violet-500",
              },
            ].map((feature, i) => (
              <motion.div key={feature.title} variants={fadeUp} custom={i}>
                <Card hoverable className="h-full">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        id="how-it-works"
        className="py-20 sm:py-28 bg-[var(--muted)] relative overflow-hidden"
      >
        <div className="absolute inset-0 gradient-mesh opacity-50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="badge badge-primary mb-4"
            >
              How It Works
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] tracking-tight"
            >
              From Signs to{" "}
              <span className="gradient-text">Conversation</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            {/* Deaf → Hearing flow */}
            <motion.div variants={fadeUp} custom={0}>
              <h3 className="text-xl font-semibold font-[family-name:var(--font-display)] mb-6 flex items-center gap-2">
                <Hand size={22} className="text-[var(--color-primary-500)]" />
                Deaf User → Hearing User
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Camera Captures Signs",
                    desc: "Your webcam feeds video to MediaPipe at 30fps",
                    icon: Eye,
                  },
                  {
                    step: "2",
                    title: "AI Extracts Landmarks",
                    desc: "543 hand, face, and body landmarks detected per frame",
                    icon: Hand,
                  },
                  {
                    step: "3",
                    title: "Gesture Classification",
                    desc: "LSTM neural network identifies sign language sequences",
                    icon: Brain,
                  },
                  {
                    step: "4",
                    title: "Text & Voice Output",
                    desc: "Corrected sentence appears as caption + AI voice speaks it",
                    icon: Volume2,
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-md group-hover:shadow-[var(--shadow-glow)] transition-shadow">
                      <span className="text-white text-sm font-bold">
                        {item.step}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hearing → Deaf flow */}
            <motion.div variants={fadeUp} custom={1}>
              <h3 className="text-xl font-semibold font-[family-name:var(--font-display)] mb-6 flex items-center gap-2">
                <Mic size={22} className="text-[var(--color-accent-500)]" />
                Hearing User → Deaf User
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Microphone Captures Speech",
                    desc: "Audio streamed via WebSocket in 2-second chunks",
                    icon: Mic,
                  },
                  {
                    step: "2",
                    title: "Whisper Transcribes",
                    desc: "Faster-Whisper with VAD converts speech to text",
                    icon: Brain,
                  },
                  {
                    step: "3",
                    title: "Caption Appears Instantly",
                    desc: "Live text overlay on the deaf user's video call screen",
                    icon: MessageSquareText,
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shrink-0 shadow-md group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-shadow">
                      <span className="text-white text-sm font-bold">
                        {item.step}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== ACCESSIBILITY ===== */}
      <section id="accessibility" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="badge badge-primary mb-4"
            >
              Accessibility First
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] tracking-tight"
            >
              Designed for{" "}
              <span className="gradient-text">Everyone</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Accessibility,
                title: "Emergency Mode",
                description:
                  "One-tap emergency phrases with instant translation for hospitals and services.",
              },
              {
                icon: Languages,
                title: "Multi-Language",
                description:
                  "ISL support with planned ASL, BSL, and more. Multi-language caption translation.",
              },
              {
                icon: Clock,
                title: "Offline Mode",
                description:
                  "Common sign recognition works without internet using on-device ML models.",
              },
              {
                icon: Shield,
                title: "End-to-End Encrypted",
                description:
                  "All video, audio, and caption data protected with SRTP and TLS 1.3 encryption.",
              },
            ].map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i}>
                <Card hoverable className="h-full text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-primary-500)]/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon
                      size={24}
                      className="text-[var(--color-primary-500)]"
                    />
                  </div>
                  <h3 className="font-semibold font-[family-name:var(--font-display)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {item.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 gradient-hero opacity-90" />
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-white/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] text-white tracking-tight"
            >
              Ready to Connect Without Barriers?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-6 text-lg text-white/80 max-w-2xl mx-auto"
            >
              Join thousands of users who are already experiencing seamless
              communication. Start your first AI-translated video call today.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <button className="btn btn-lg bg-white text-[var(--color-primary-700)] hover:bg-white/90 shadow-xl hover:shadow-2xl font-semibold">
                  Get Started Free
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/login">
                <button className="btn btn-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm">
                  I Have an Account
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
