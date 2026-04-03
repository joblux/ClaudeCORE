'use client'

const LANG_CODES = ['fr', 'ar', 'it', 'es', 'de', 'zh', 'ja', 'ru'] as const
const BASE_URL = 'https://joblux.com'

export function HreflangTags({ slug }: { slug: string }) {
  return (
    <>
      <link rel="alternate" hrefLang="en" href={`${BASE_URL}/wikilux/${slug}`} />
      <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/wikilux/${slug}`} />
      {LANG_CODES.map((code) => (
        <link key={code} rel="alternate" hrefLang={code} href={`${BASE_URL}/wikilux/${slug}/${code}`} />
      ))}
    </>
  )
}
