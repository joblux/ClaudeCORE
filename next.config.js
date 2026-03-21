const { withSentryConfig } = require("@sentry/nextjs")

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    WIKILUX_API_KEY: process.env.WIKILUX_API_KEY,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'zspcmvdoqhvrcdynlriz.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'media.licdn.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/jobs', destination: '/opportunities', permanent: true },
      { source: '/jobs/:path*', destination: '/opportunities/:path*', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/offline',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
    ]
  },
}

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  hideSourceMaps: true,
})
