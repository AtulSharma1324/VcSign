import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Left panel — decorative background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 flex-col justify-between p-16 select-none border-r border-white/5">
        
        {/* Full-bleed AI-generated background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/auth_hero.png" 
            alt="Sign Language Background"
            className="w-full h-full object-cover opacity-45"
          />
          {/* Dark gradient overlay for typography readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary-500)] to-[var(--color-accent-500)] flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <span className="text-xl">🤟</span>
          </div>
          <span className="text-lg font-bold font-[family-name:var(--font-display)] text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
            SignLang VC
          </span>
        </div>

        {/* Hero Content Overlaid */}
        <div className="relative z-10 flex flex-col justify-center my-auto max-w-md w-full">
          <h1 className="text-4xl font-extrabold font-[family-name:var(--font-display)] tracking-tight leading-tight text-white">
            Communication
            <br />
            Without Limits
          </h1>
          <p className="mt-6 text-base text-slate-300 leading-relaxed">
            AI-powered sign language translation for seamless video calls
            between deaf and hearing users.
          </p>
          
          {/* Subtle live indicator representing real-time system */}
          <div className="mt-8 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-400 tracking-widest uppercase">Real-time Translation Live</span>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/40 border-t border-white/5 pt-6">
          <span>&copy; {new Date().getFullYear()} SignLang VC</span>
          <div className="flex gap-4">
            <span className="hover:text-white/60 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
