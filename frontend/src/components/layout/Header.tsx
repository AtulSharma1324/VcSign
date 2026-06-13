"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { APP_NAME } from "@/lib/constants";

// ===========================
// Header Component
// ===========================

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#accessibility", label: "Accessibility" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-shadow">
              <span className="text-white text-lg">🤟</span>
            </div>
            <span className="text-lg font-bold font-[family-name:var(--font-display)] tracking-tight">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? <Sun size={18} /> : <Moon size={18} />
              ) : (
                <div className="w-[18px] h-[18px]" />
              )}
            </button>

            <Link
              href="/login"
              className="hidden sm:inline-flex btn btn-ghost text-sm"
            >
              Log in
            </Link>
            <Link href="/register" className="btn btn-primary text-sm">
              Get Started
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-[var(--muted)] transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--border)] glass"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-[var(--muted)] transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/login"
                className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-[var(--muted)] transition-colors sm:hidden"
                onClick={() => setIsMobileOpen(false)}
              >
                Log in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
