import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SignLang VC — AI Sign Language Video Call Translator",
  description:
    "Break communication barriers with AI-powered sign language translation during live video calls. Real-time ISL recognition, live captions, and voice synthesis.",
  keywords: [
    "sign language",
    "video call",
    "AI translator",
    "ISL",
    "deaf communication",
    "accessibility",
    "live captions",
  ],
  authors: [{ name: "SignLang VC" }],
  openGraph: {
    title: "SignLang VC — AI Sign Language Video Call Translator",
    description:
      "Break communication barriers with AI-powered sign language translation during live video calls.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "glass",
              style: {
                borderRadius: "1rem",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
