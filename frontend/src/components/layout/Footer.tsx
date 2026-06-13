import React from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

// ===========================
// Footer Component
// ===========================

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { href: "#features", label: "Features" },
        { href: "#how-it-works", label: "How It Works" },
        { href: "#accessibility", label: "Accessibility" },
        { href: "/pricing", label: "Pricing" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "/docs", label: "Documentation" },
        { href: "/api", label: "API Reference" },
        { href: "/blog", label: "Blog" },
        { href: "/support", label: "Support" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/security", label: "Security" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white text-sm">🤟</span>
              </div>
              <span className="font-bold font-[family-name:var(--font-display)]">
                {APP_NAME}
              </span>
            </Link>
            <p className="mt-3 text-sm text-[var(--muted-foreground)] max-w-xs">
              Breaking communication barriers with AI-powered sign language
              translation.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            © {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--muted-foreground)]">
              Made with ❤️ for accessibility
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
