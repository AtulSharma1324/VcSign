import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-[60px]" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
            <span className="text-3xl">🤟</span>
          </div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] tracking-tight leading-tight">
            Communication
            <br />
            Without Limits
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-md">
            AI-powered sign language translation for seamless video calls
            between deaf and hearing users.
          </p>

          <div className="mt-12 space-y-4">
            {[
              "Real-time ISL recognition",
              "Live captions & AI voice",
              "End-to-end encrypted",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2.5 6L5 8.5L9.5 4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
