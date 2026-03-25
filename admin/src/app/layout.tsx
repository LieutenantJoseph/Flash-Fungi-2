// admin/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Flash Fungi Admin",
    template: "%s | FF Admin",
  },
  description: "Flash Fungi content management portal",
  robots: "noindex, nofollow", // Admin should never be indexed
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-admin-bg text-admin-text antialiased">
        {children}
      </body>
    </html>
  );
}
