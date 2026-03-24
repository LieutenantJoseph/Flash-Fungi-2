// src/app/layout.tsx
// Root layout for the entire Flash Fungi app.
// Loads fonts, global styles, and wraps children with providers.

import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "700"],
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Flash Fungi — Master Mycology",
    template: "%s | Flash Fungi",
  },
  description:
    "Learn mushroom identification with DNA-verified specimens. Interactive flashcards, training modules, and field guides for mycology enthusiasts.",
  keywords: ["mushroom", "identification", "mycology", "fungi", "education", "field guide"],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8B4513",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen bg-fungi-bg text-fungi-text antialiased">
        {children}
      </body>
    </html>
  );
}
