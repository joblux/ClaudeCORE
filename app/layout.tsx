import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.luxuryrecruiter.com'),
  alternates: { canonical: './' },
  title: {
    default: 'JOBLUX — Luxury, decoded.',
    template: '%s',
  },
  description:
    "JOBLUX brings together luxury intelligence, salary insight, interviews, recruitment, and travel for the global luxury world. Free to access, with deeper value shaped by contribution.",
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: "JOBLUX — Luxury, decoded.",
    description: "JOBLUX brings together luxury intelligence, salary insight, interviews, recruitment, and travel for the global luxury world. Free to access, with deeper value shaped by contribution.",
    url: "https://www.luxuryrecruiter.com",
    siteName: "JOBLUX",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/api/og?title=JOBLUX&subtitle=Luxury%2C+decoded.",
        width: 1200,
        height: 630,
        alt: "JOBLUX — Luxury, decoded.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JOBLUX — Luxury, decoded.",
    description: "JOBLUX brings together luxury intelligence, salary insight, interviews, recruitment, and travel for the global luxury world. Free to access, with deeper value shaped by contribution.",
    images: ["/api/og?title=JOBLUX&subtitle=Luxury%2C+decoded."],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="alternate" type="application/rss+xml" title="JOBLUX BlogLux" href="/rss.xml" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased overflow-x-hidden min-h-screen`}>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
