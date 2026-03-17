// ═══════════════════════════════════════════════════
// app/layout.tsx — UPDATE YOUR EXISTING LAYOUT
// Add the AuthProvider wrapper around {children}
// ═══════════════════════════════════════════════════

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "JOBLUX — Luxury Talents Intelligence",
  description:
    "Executive search, brand intelligence, and luxury career advisory. Paris · London · New York · Dubai · Singapore.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        {/* ↓ Wrap everything in AuthProvider for client-side session access */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
