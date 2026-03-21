import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join JOBLUX | Luxury Talents Society",
  description:
    "Join the luxury talents society. Free access to salary data, brand insights, and executive positions across 150+ maisons.",
  openGraph: {
    title: "You've been invited to JOBLUX",
    description:
      "Join the luxury talents society. Free access to salary data, brand insights, and executive positions.",
    url: "https://www.luxuryrecruiter.com/join",
    siteName: "JOBLUX",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.luxuryrecruiter.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "JOBLUX | Luxury Talents Society",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "You've been invited to JOBLUX",
    description:
      "Join the luxury talents society.",
    images: ["https://www.luxuryrecruiter.com/og-image.png"],
  },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
