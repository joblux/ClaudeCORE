import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// Browser-like User-Agent to avoid being blocked
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * Fetch a URL with a 10-second timeout and browser User-Agent.
 */
async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Extract JSON-LD data from HTML looking for JobPosting schema.
 */
function extractJsonLd(html: string): any | null {
  // Match all <script type="application/ld+json"> blocks
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match

  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].trim())

      // Direct JobPosting
      if (data['@type'] === 'JobPosting') return data

      // Array of schemas
      if (Array.isArray(data)) {
        const jobPosting = data.find((item: any) => item['@type'] === 'JobPosting')
        if (jobPosting) return jobPosting
      }

      // @graph array (common in structured data)
      if (data['@graph'] && Array.isArray(data['@graph'])) {
        const jobPosting = data['@graph'].find((item: any) => item['@type'] === 'JobPosting')
        if (jobPosting) return jobPosting
      }
    } catch {
      // Invalid JSON in this script tag, continue to next
      continue
    }
  }

  return null
}

/**
 * Map a Schema.org JobPosting to JOBLUX assignment fields.
 */
function mapJobPosting(data: any): Record<string, any> {
  const job: Record<string, any> = {}

  job.title = data.title || null
  job.description = data.description || null

  if (typeof data.hiringOrganization === 'string') {
    job.maison = data.hiringOrganization
  } else if (data.hiringOrganization?.name) {
    job.maison = data.hiringOrganization.name
  }

  if (data.jobLocation) {
    const location = Array.isArray(data.jobLocation) ? data.jobLocation[0] : data.jobLocation
    if (typeof location === 'string') {
      job.city = location
    } else if (location?.address) {
      const address = typeof location.address === 'string'
        ? { addressLocality: location.address }
        : location.address
      job.city = address.addressLocality || address.addressRegion || null
      job.country = address.addressCountry || null
    }
  }

  if (data.baseSalary) {
    if (typeof data.baseSalary === 'object') {
      const salary = data.baseSalary.value || data.baseSalary
      if (typeof salary === 'object') {
        job.salary_min = salary.minValue || salary.value || null
        job.salary_max = salary.maxValue || null
        job.salary_currency = data.baseSalary.currency || salary.currency || null
        job.salary_period = salary.unitText || null
      } else {
        job.salary_min = salary
      }
    } else {
      job.salary_min = data.baseSalary
    }
  }

  job.contract_type = data.employmentType || null
  job.date_posted = data.datePosted || null
  job.valid_through = data.validThrough || null
  job.responsibilities = data.responsibilities || null
  job.requirements = data.qualifications || data.experienceRequirements || null
  job.benefits = data.jobBenefits || null

  return job
}

/**
 * Use Claude to extract job data from raw page text when no structured data is found.
 */
async function extractWithAI(pageText: string): Promise<Record<string, any>> {
  // Truncate to ~4000 words (roughly 15000 chars)
  const truncatedText = pageText.slice(0, 15000)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: 'You are a job posting parser for a luxury recruitment platform. Extract structured job data from the following text. Return ONLY a valid JSON object with these fields: title, company, city, country, description, responsibilities, requirements, qualifications, salary_min, salary_max, salary_currency, department, seniority, contract_type, remote_policy, benefits, languages_required, nice_to_haves. For array fields (benefits, languages_required), return arrays. For missing fields, use null. Return valid JSON only.',
    messages: [{ role: 'user', content: truncatedText }],
  })

  // Extract text from the response
  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI')
  }

  // Parse the JSON response, handling potential markdown code blocks
  let jsonText = textBlock.text.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7)
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3)
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3)
  }
  jsonText = jsonText.trim()

  const parsed = JSON.parse(jsonText)

  // Rename 'company' to 'maison' if present
  if (parsed.company && !parsed.maison) {
    parsed.maison = parsed.company
    delete parsed.company
  }

  return parsed
}

/**
 * Process a single URL: fetch, try JSON-LD, fall back to AI extraction.
 */
async function processUrl(url: string): Promise<{ assignment: Record<string, any> | null; error: string | null }> {
  try {
    const html = await fetchPage(url)

    // Try JSON-LD extraction first
    const jsonLd = extractJsonLd(html)
    if (jsonLd) {
      const assignment = mapJobPosting(jsonLd)
      assignment.source_url = url
      return { assignment, error: null }
    }

    // Fall back to AI extraction: strip HTML tags to get plain text
    const plainText = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!plainText || plainText.length < 50) {
      return { assignment: null, error: 'Page has insufficient text content' }
    }

    const assignment = await extractWithAI(plainText)
    assignment.source_url = url
    return { assignment, error: null }
  } catch (error: any) {
    return { assignment: null, error: error.message || 'Unknown error' }
  }
}

/**
 * POST /api/assignments/import/url
 *
 * Accepts { url: string } or { urls: string[] } for bulk URL import.
 * Fetches each page, extracts structured data via JSON-LD or AI fallback,
 * and returns parsed assignment data.
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authorization check
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const urls: string[] = []

    if (body.url) {
      urls.push(body.url)
    } else if (body.urls && Array.isArray(body.urls)) {
      urls.push(...body.urls)
    } else {
      return NextResponse.json({ error: 'Provide "url" or "urls" in request body' }, { status: 400 })
    }

    // Validate URLs
    for (const url of urls) {
      try {
        new URL(url)
      } catch {
        return NextResponse.json({ error: `Invalid URL: ${url}` }, { status: 400 })
      }
    }

    const assignments: Record<string, any>[] = []
    const errors: { url: string; error: string }[] = []

    // Process URLs sequentially to avoid rate limits
    for (const url of urls) {
      const result = await processUrl(url)
      if (result.assignment) {
        assignments.push(result.assignment)
      }
      if (result.error) {
        errors.push({ url, error: result.error })
      }
    }

    return NextResponse.json({ assignments, errors })
  } catch (error: any) {
    console.error('URL import error:', error)
    return NextResponse.json(
      { error: 'Failed to process URL(s)', details: error.message },
      { status: 500 }
    )
  }
}
