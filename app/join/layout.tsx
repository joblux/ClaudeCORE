import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Access | JOBLUX",
  description:
    "Request access to JOBLUX. Free access to salary data, brand insights, and executive positions across 150+ maisons.",
  openGraph: {
    title: "You've been invited to JOBLUX",
    description:
      "Request access to JOBLUX. Free access to salary data, brand insights, and executive positions.",
    url: "https://joblux.com/join",
    siteName: "JOBLUX",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://joblux.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "JOBLUX | Luxury Industry Careers Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "You've been invited to JOBLUX",
    description:
      "Request access to JOBLUX.",
    images: ["https://joblux.com/og-image.png"],
  },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
