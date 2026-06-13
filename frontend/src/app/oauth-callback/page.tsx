"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userParam = searchParams.get("user");

    if (accessToken && refreshToken && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        login(user, accessToken, refreshToken);
        toast.success(`Welcome, ${user.displayName}!`);
        router.push("/dashboard");
      } catch (err) {
        console.error("Failed to parse user data from OAuth callback:", err);
        toast.error("Authentication failed. Please try again.");
        router.push("/login");
      }
    } else {
      toast.error("Authentication failed. Missing tokens.");
      router.push("/login");
    }
  }, [searchParams, login, router]);

  return null;
}

export default function OAuthCallbackPage() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--background)]">
      <Suspense fallback={null}>
        <OAuthCallbackHandler />
      </Suspense>
      <div className="w-12 h-12 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-xl font-medium text-[var(--foreground)]">
        Authenticating...
      </h2>
      <p className="text-sm text-[var(--muted-foreground)] mt-2">
        Please wait while we log you in.
      </p>
    </div>
  );
}
