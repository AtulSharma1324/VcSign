"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Hand } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    userType: "both" as "deaf" | "hearing" | "both",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.displayName.trim()) errs.displayName = "Name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Min 8 characters required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { data } = await authApi.post("/register", form);
      login(data.user, data.accessToken, data.refreshToken);
      toast.success("Account created! Welcome aboard.");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const userTypes = [
    {
      value: "deaf" as const,
      label: "Deaf / Hard of Hearing",
      icon: Hand,
      description: "I communicate using sign language",
    },
    {
      value: "hearing" as const,
      label: "Hearing",
      icon: User,
      description: "I communicate by speaking",
    },
    {
      value: "both" as const,
      label: "Both",
      icon: User,
      description: "I use both sign language and speech",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          Create Your Account
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Start communicating without barriers
        </p>
      </div>

      {/* OAuth */}
      <button
        type="button"
        className="btn btn-secondary w-full mb-6"
        onClick={() => {
          window.location.href = `${process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:4001/api/auth"}/oauth/google`;
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-[var(--background)] text-[var(--muted-foreground)]">
            or register with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Your name"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          error={errors.displayName}
          leftIcon={<User size={16} />}
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          leftIcon={<Mail size={16} />}
          autoComplete="email"
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          hint="Minimum 8 characters"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-[var(--foreground)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          autoComplete="new-password"
        />

        {/* User Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">I am</label>
          <div className="grid grid-cols-3 gap-2">
            {userTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setForm({ ...form, userType: type.value })}
                className={`p-3 rounded-xl border text-center transition-all text-xs ${
                  form.userType === type.value
                    ? "border-[var(--color-primary-500)] bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]"
                    : "border-[var(--border)] hover:border-[var(--color-primary-300)] text-[var(--muted-foreground)]"
                }`}
              >
                <type.icon size={18} className="mx-auto mb-1" />
                <span className="font-medium block">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
