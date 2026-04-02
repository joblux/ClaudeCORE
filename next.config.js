const { withSentryConfig } = require("@sentry/nextjs")

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
  env: {
    WIKILUX_API_KEY: process.env.WIKILUX_API_KEY,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'zspcmvdoqhvrcdynlriz.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: 'media.foratravel.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/jobs', destination: '/careers', permanent: true },
      { source: '/jobs/:path*', destination: '/careers/:path*', permanent: true },
      { source: '/wikilux', destination: '/brands', permanent: true },
      { source: '/wikilux/:slug*', destination: '/brands/:slug*', permanent: true },
      { source: '/salaries', destination: '/careers', permanent: true },
    ]
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
