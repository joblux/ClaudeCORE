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
  title: "JOBLUX — Luxury Talents Society",
  description:
    "The intelligence platform for luxury professionals. Salary data, brand insights, executive search, and career intelligence across 150+ maisons. Free against contribution — no ads, no noise.",
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: "JOBLUX — Luxury Talents Society",
    description: "The intelligence platform for luxury professionals. Salary data, brand insights, executive search across 150+ maisons.",
    url: "https://www.luxuryrecruiter.com",
    siteName: "JOBLUX",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.luxuryrecruiter.com/api/og?title=JOBLUX&subtitle=Luxury+Talents+Society",
        width: 1200,
        height: 630,
        alt: "JOBLUX — Luxury Talents Society",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JOBLUX — Luxury Talents Society",
    description: "The intelligence platform for luxury professionals.",
    images: ["https://www.luxuryrecruiter.com/api/og?title=JOBLUX&subtitle=Luxury+Talents+Society"],
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
