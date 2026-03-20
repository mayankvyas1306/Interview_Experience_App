import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import BootstrapClient from "@/components/BootstrapClient";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

/**
 * Next.js font optimization — loads Inter from Google Fonts
 * with zero layout shift (preloaded, subset, variable font).
 *
 * Why not just import from CSS?
 * next/font automatically:
 * - Self-hosts the font (no external request to Google)
 * - Adds font-display: swap to prevent invisible text
 * - Generates a CSS variable you can use everywhere
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InterviewPulse — Share & Discover Interview Experiences",
    template: "%s | InterviewPulse",
  },
  description:
    "Discover real interview experiences from top companies. Share your journey, find preparation tips, and crack your next interview with AI-powered insights.",
  keywords: [
    "interview experience",
    "software engineering interview",
    "placement experience",
    "interview questions",
    "tech interview prep",
  ],
  authors: [{ name: "InterviewPulse" }],
  creator: "InterviewPulse",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "InterviewPulse",
    title: "InterviewPulse — Share & Discover Interview Experiences",
    description:
      "Real interview stories from real engineers. Prepare smarter.",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewPulse",
    description: "Real interview stories from real engineers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070A12",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <BootstrapClient />
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "rgba(13, 17, 32, 0.96)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(12px)",
                borderRadius: "12px",
                fontSize: "0.875rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              },
              success: {
                iconTheme: { primary: "#00D4FF", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#FF6B6B", secondary: "#fff" },
              },
            }}
          />
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}