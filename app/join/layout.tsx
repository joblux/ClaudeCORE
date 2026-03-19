import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join JOBLUX — Luxury Talents Intelligence",
  description:
    "Join the intelligence platform for luxury professionals. Free access to salary data, brand insights, and executive positions across 150+ maisons.",
  openGraph: {
    title: "You've been invited to JOBLUX",
    description:
      "Join the intelligence platform for luxury professionals. Free access to salary data, brand insights, and executive positions.",
    url: "https://www.luxuryrecruiter.com/join",
    siteName: "JOBLUX",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.luxuryrecruiter.com/api/og",
        width: 1200,
        height: 630,
        alt: "JOBLUX — Luxury Talents Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "You've been invited to JOBLUX",
    description:
      "Join the intelligence platform for luxury professionals.",
    images: ["https://www.luxuryrecruiter.com/api/og"],
  },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
