import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.joblux.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard',
          '/profile',
          '/members/pending',
          '/members/check-email',
          '/contribute',
          '/invite',
          '/directory',
          '/offline',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
