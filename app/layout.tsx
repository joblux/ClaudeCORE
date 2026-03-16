import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default:  'JOBLUX — Luxury Talents Intelligence',
    template: '%s | JOBLUX',
  },
  description: 'The private intelligence platform for luxury industry professionals. Executive search, market intelligence and industry insights. Est. Paris 2006.',
  keywords:    ['luxury recruitment', 'luxury jobs', 'executive search luxury', 'luxury talent', 'LVMH careers', 'Kering jobs', 'luxury salary'],
  authors:     [{ name: 'JOBLUX', url: 'https://joblux.com' }],
  creator:     'JOBLUX',
  publisher:   'JOBLUX',
  metadataBase: new URL('https://joblux.com'),
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         'https://joblux.com',
    siteName:    'JOBLUX',
    title:       'JOBLUX — Luxury Talents Intelligence',
    description: 'The private intelligence platform for luxury industry professionals.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'JOBLUX' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'JOBLUX — Luxury Talents Intelligence',
    description: 'The private intelligence platform for luxury industry professionals.',
    images:      ['/og-image.jpg'],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
