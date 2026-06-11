// ---------------------------------------------------------------------------
// LuxAI Signals — Source Page Reader (633d6f8c Slice B2)
//
// Robust read ladder for one source_url, feeding synthesis:
//   (a) plain fetch (10s timeout, desktop UA) → html-to-text strip;
//       usable when ≥ MIN_USABLE_CHARS → read_method 'fetch'
//   (b) else Apify rag-web-browser single-URL scrape (scrapeUrl) →
//       ≥ MIN_USABLE_CHARS → read_method 'apify'
//   (c) else { text: null, read_method: null } — unread is an honest state
//       the synthesis layer handles (source_read=false), never an exception.
//
// NEVER throws. No DB, no queue knowledge — url in, text out.
// Apify confinement: the vendor client stays inside providers/apify-provider;
// this file only consumes the plain-text scrapeUrl seam.
// ---------------------------------------------------------------------------

import { scrapeUrl } from './providers/apify-provider'

export type PageReadResult = {
  text: string | null
  read_method: 'fetch' | 'apify' | null
}

// B1 validation proved <500 chars = walled/thin shell, not an article.
const MIN_USABLE_CHARS = 500
const FETCH_TIMEOUT_MS = 10000
const DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

// Strip HTML to readable plain text (same regex shape as the corpus builder's
// route-private htmlToText — that helper is not exported, local copy kept
// byte-identical).
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function plainFetchText(url: string): Promise<string | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': DESKTOP_UA },
      signal: controller.signal,
    })
    if (!response.ok) return null
    return htmlToText(await response.text())
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Read one source page through the fetch → apify ladder.
 * Unreadable/walled/thin → { text: null, read_method: null }; never throws.
 */
export async function readSourcePage(url: string): Promise<PageReadResult> {
  const fetched = await plainFetchText(url)
  if (fetched && fetched.length >= MIN_USABLE_CHARS) {
    return { text: fetched, read_method: 'fetch' }
  }

  const scraped = await scrapeUrl(url)
  if (scraped && scraped.length >= MIN_USABLE_CHARS) {
    return { text: scraped, read_method: 'apify' }
  }

  return { text: null, read_method: null }
}
