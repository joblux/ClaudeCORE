import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PARSER_MODEL = 'claude-haiku-4-5'
const PARSER_MAX_TOKENS = 4000
const PARSER_TEMPERATURE = 0
const SCHEMA_VERSION = '1.0'
const MIN_CV_TEXT_CHARS = 100
const MAX_CV_TEXT_CHARS = 50000
const IDEMPOTENCE_WINDOW_SECONDS = 60

// Verified Apr 29 2026 against Anthropic public pricing pages.
// Source: anthropic.com/claude/haiku, platform.claude.com/docs/en/about-claude/pricing
// Haiku 4.5: $1 / 1M input tokens, $5 / 1M output tokens.
const HAIKU_4_5_INPUT_COST_PER_TOKEN = 0.000001
const HAIKU_4_5_OUTPUT_COST_PER_TOKEN = 0.000005

const LOCKED_SECTORS = [
  'Fashion', 'Jewelry', 'Watches', 'Beauty',
  'Hospitality', 'Automotive', 'Spirits & Wine', 'Art & Culture',
] as const

const LOCKED_PROFICIENCIES = [
  'Native', 'Fluent', 'Professional', 'Conversational', 'Basic',
] as const

const SYSTEM_PROMPT = `You are a CV parser for JOBLUX, a luxury careers intelligence platform.

ROLE
Your task is NORMALIZATION, not validation. You convert a dirty, unstructured, possibly multilingual CV into a structured ProfiLux JSON draft. Downstream steps (user review, admin approval, profile refinement) handle validation and completeness. Your job is to capture everything useful that is present, faithfully, without inventing.

OUTPUT FORMAT
Return ONLY a single JSON object. No markdown, no code fences, no commentary, no preamble. Start with { and end with }.

LANGUAGE HANDLING
The CV may be in any language (French, English, Italian, Spanish, Arabic, German, etc.). Extract content faithfully regardless of language. Preserve names, companies, job titles, cities, and descriptions in the CV's ORIGINAL language. Translate values into English ONLY for the locked vocabularies (sectors, language proficiency).

JSON SCHEMA

{
  "identity": {
    "first_name": string|null,
    "last_name": string|null,
    "city": string|null,
    "country": string|null,
    "nationality": string|null,
    "phone": string|null,
    "email": string|null
  },
  "experiences": [
    {
      "company": string|null,
      "job_title": string|null,
      "city": string|null,
      "country": string|null,
      "start_date": string|null,
      "end_date": string|null,
      "is_current": boolean,
      "description": string|null,
      "raw_dates_text": string|null
    }
  ],
  "education": [
    {
      "institution": string|null,
      "degree_level": string|null,
      "field_of_study": string|null,
      "city": string|null,
      "country": string|null,
      "start_year": integer|null,
      "graduation_year": integer|null
    }
  ],
  "sectors": [string],
  "languages": [
    { "language": string, "proficiency": string|null }
  ],
  "availability": null,
  "confidence": {
    "identity": number,
    "experiences": number,
    "education": number,
    "sectors": number,
    "languages": number,
    "overall": number
  },
  "needs_review": [
    {
      "section": string,
      "index": integer,
      "field": string,
      "reason": string,
      "raw_value": string|null
    }
  ]
}

EXTRACTION RULES

identity
- Extract name, location, nationality, phone, email if present in the CV header or contact block.
- Do NOT infer nationality from country of residence.
- email and phone: copy verbatim from the CV.

experiences
- One entry per professional position. Most recent first.
- Capture as much as you can. If company is uncertain or job_title is missing, you MAY still emit the row with that field null AND add an entry to needs_review describing the gap. Useful partial data is better than dropping a position.
- start_date and end_date: use ISO format. Accept partial precision: "YYYY-MM-DD", "YYYY-MM", or "YYYY". Use null if absent. Imperfect dates are fine — flag them in needs_review.
- is_current: true ONLY if the CV explicitly indicates "Present", "Current", "Now", "en cours", "actuellement", "attuale", "actual", or end_date is missing for the most recent role.
- raw_dates_text: copy the original date string from the CV (e.g. "Mar 2019 – Present", "déc. 2020 – aujourd'hui") to preserve evidence for review.
- description: short summary if present in the CV, max 500 chars. Null if absent.
- Do NOT include education entries here. Internships in companies count as experiences only if listed under work/professional sections.
- If you genuinely cannot identify either company OR job_title, do not emit the row.

education
- One entry per degree, certification, or formal program.
- Same partial-capture rule: if institution is unclear, emit with null and a needs_review entry. Do not drop useful information.
- degree_level: copy what the CV says (Master, Bachelor, MBA, BTS, Licence, PhD, Maîtrise, Laurea, Diplom, etc.). No taxonomy mapping.
- start_year and graduation_year: integers or null.

sectors
- Infer luxury sectors from companies and job content.
- Use ONLY these 8 values, exact English spelling: "Fashion", "Jewelry", "Watches", "Beauty", "Hospitality", "Automotive", "Spirits & Wine", "Art & Culture".
- These are normalization labels in English; the CV may use other terms — translate to the closest match: "joaillerie" -> "Jewelry", "horlogerie" -> "Watches", "parfumerie/cosmétique" -> "Beauty", "hôtellerie" -> "Hospitality", "moda" -> "Fashion", "automobile" -> "Automotive", "vins & spiritueux" -> "Spirits & Wine".
- If a company is non-luxury (e.g. McDonald's, Accenture), do NOT add a sector for it.
- Empty array [] is valid if no luxury sectors detected.
- Do not duplicate. Do not invent sectors outside the 8 listed.

languages
- One entry per language mentioned in a Languages section.
- The CV may list languages in any language ("français", "anglais", "italiano", "español"). Preserve the language NAME as it appears in the CV.
- proficiency: map to ONE of "Native", "Fluent", "Professional", "Conversational", "Basic". The CV may use any vocabulary or framework (CEFR levels, French wording, Italian, Spanish, etc.).
  - "Mother tongue", "C2", "bilingue", "langue maternelle", "madrelingua", "lengua materna" -> "Native"
  - "C1", "Advanced", "Fluent", "courant", "fluido" -> "Fluent"
  - "B2", "Professional working", "professionnel", "professionale" -> "Professional"
  - "B1", "Intermediate", "Conversational", "intermédiaire", "intermedio" -> "Conversational"
  - "A1", "A2", "Basic", "Beginner", "Notions", "débutant", "principiante" -> "Basic"
  - If unmappable or unclear -> null and add a needs_review entry.

availability
- ALWAYS null. CVs do not state availability.

confidence
- Float 0.0 to 1.0 per section.
- 1.0 = section fully extracted with high certainty.
- 0.5 = partial or ambiguous extraction.
- 0.0 = section missing or unparseable.
- "overall" = weighted average of section scores.

needs_review
- One entry per field that requires human attention.
- section: "identity" | "experiences" | "education" | "sectors" | "languages"
- index: position in the array (0 for identity which is single-object)
- field: the specific field name (e.g. "start_date")
- reason: short machine-friendly code: "dates_unclear", "company_ambiguous", "missing_required", "garbled_text", "language_proficiency_unmappable", "name_format_unusual"
- raw_value: the original CV text snippet that triggered the flag, max 200 chars. Null if not applicable.
- Empty array [] if everything parsed cleanly.

GLOBAL CONSTRAINTS
- Never include schema_version, parsed_at, source, or other metadata. The server adds these.
- Do not include unknown top-level fields (no "skills", "achievements", "summary", "linkedin", "tools").
- If the CV is empty, garbled, or in an unparseable language, return all sections with null/empty arrays and confidence 0.0, with a needs_review entry explaining the issue.
- Do not refuse. Do not ask questions. Always return a valid JSON object even if extraction is poor.`

// Permissive schema: company/job_title/institution may be null; partial rows allowed.
// Strip behavior is default Zod (no .strict()) — extra harmless keys are dropped silently.
const CvParsedDataSchema = z.object({
  identity: z.object({
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    nationality: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
  }),
  experiences: z.array(z.object({
    company: z.string().nullable(),
    job_title: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    start_date: z.string().nullable(),
    end_date: z.string().nullable(),
    is_current: z.boolean(),
    description: z.string().max(500).nullable(),
    raw_dates_text: z.string().nullable(),
  })),
  education: z.array(z.object({
    institution: z.string().nullable(),
    degree_level: z.string().nullable(),
    field_of_study: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    start_year: z.number().int().nullable(),
    graduation_year: z.number().int().nullable(),
  })),
  sectors: z.array(z.enum(LOCKED_SECTORS)),
  languages: z.array(z.object({
    language: z.string().min(1),
    proficiency: z.enum(LOCKED_PROFICIENCIES).nullable(),
  })),
  availability: z.null(),
  confidence: z.object({
    identity: z.number().min(0).max(1),
    experiences: z.number().min(0).max(1),
    education: z.number().min(0).max(1),
    sectors: z.number().min(0).max(1),
    languages: z.number().min(0).max(1),
    overall: z.number().min(0).max(1),
  }),
  needs_review: z.array(z.object({
    section: z.enum(['identity', 'experiences', 'education', 'sectors', 'languages']),
    index: z.number().int().min(0),
    field: z.string(),
    reason: z.string(),
    raw_value: z.string().max(200).nullable(),
  })),
})
// No .strict() — extra harmless keys are silently dropped (default Zod behavior).

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: code, message }, { status })
}

async function logHistory(payload: {
  status: 'success' | 'error',
  member_id: string,
  text_length: number,
  tokens_used?: number,
  cost_usd?: number,
  error_message?: string,
}) {
  try {
    await supabase.from('luxai_history').insert({
      type: 'cv_parse',
      model: PARSER_MODEL,
      prompt: `[CV parse, member_id=${payload.member_id}, text_length=${payload.text_length}]`,
      response: {},
      tokens_used: payload.tokens_used ?? 0,
      cost_usd: payload.cost_usd ?? 0,
      status: payload.status,
      error_message: payload.error_message ?? null,
    })
  } catch (err) {
    console.error('[cv-parse] luxai_history log failed:', err)
  }
}

// Normalize cv_url to storage path-only.
// Legacy rows store full Supabase Storage URLs; new uploads store path-only.
function normalizeCvStoragePath(cvUrl: string): string {
  const value = cvUrl.trim()
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return value
  }
  const match = value.match(/\/(?:object\/public|object\/sign|object\/authenticated)\/member-cvs\/(.+?)(?:\?|$)/)
  return match ? match[1] : value
}

export async function POST(req: NextRequest) {
  // Auth
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId
  if (!memberId) {
    return errorResponse('M6_NOT_AUTHENTICATED', 'Authentication required', 401)
  }

  // API key guard
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[cv-parse] ANTHROPIC_API_KEY not configured')
    return errorResponse('M6_API_KEY_MISSING', 'Parser unavailable', 500)
  }

  // Read member state
  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select('id, cv_url, cv_parsed_data, cv_parsed_at')
    .eq('id', memberId)
    .maybeSingle()

  if (memberErr || !member) {
    console.error('[cv-parse] member not found or query error:', memberErr)
    return errorResponse('M6_MEMBER_NOT_FOUND', 'Member record not accessible', 404)
  }

  if (!member.cv_url) {
    return errorResponse('M6_NO_CV_UPLOADED', 'No CV uploaded for this member', 400)
  }

  const cvPath = normalizeCvStoragePath(member.cv_url)

  // Idempotence: short window cache, ONLY if cached parse refers to the SAME cv_url
  // (a re-upload changes cv_url, in which case we must re-parse)
  if (member.cv_parsed_at && member.cv_parsed_data) {
    const ageMs = Date.now() - new Date(member.cv_parsed_at).getTime()
    const cachedPath =
      typeof member.cv_parsed_data === 'object' &&
      member.cv_parsed_data !== null &&
      'source' in (member.cv_parsed_data as any)
        ? (member.cv_parsed_data as any).source?.cv_storage_path
        : null
    const samePath = typeof cachedPath === 'string' && normalizeCvStoragePath(cachedPath) === cvPath
    if (ageMs < IDEMPOTENCE_WINDOW_SECONDS * 1000 && samePath) {
      return NextResponse.json({
        success: true,
        cached: true,
        parsed: member.cv_parsed_data,
        parsed_at: member.cv_parsed_at,
      })
    }
  }

  // Download CV from Storage (read-only — never modifies cv_url, member_documents, or bucket contents)
  const { data: fileBlob, error: dlErr } = await supabase.storage
    .from('member-cvs')
    .download(cvPath)

  if (dlErr || !fileBlob) {
    console.error('[cv-parse] CV file download error:', dlErr)
    return errorResponse('M6_CV_FILE_NOT_FOUND', 'CV file not retrievable from storage', 404)
  }

  const buffer = Buffer.from(await fileBlob.arrayBuffer())

  // Detect format
  const lowerPath = cvPath.toLowerCase()
  const isPdf = lowerPath.endsWith('.pdf')
  const isDocx = lowerPath.endsWith('.docx')
  const isDoc = lowerPath.endsWith('.doc') && !isDocx

  if (isDoc) {
    return errorResponse(
      'M6_DOC_FORMAT_UNSUPPORTED',
      'Legacy .doc binary format not supported. Please re-upload as PDF or .docx.',
      422
    )
  }

  if (!isPdf && !isDocx) {
    return errorResponse(
      'M6_DOC_FORMAT_UNSUPPORTED',
      'Unsupported CV format. Please upload PDF or .docx.',
      422
    )
  }

  // Extract text
  let extractedText = ''
  let extractionMethod: 'pdf-parse' | 'mammoth' = 'pdf-parse'

  try {
    if (isPdf) {
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: new Uint8Array(buffer) })
      const result = await parser.getText()
      extractedText = (result.text || '').trim()
      extractionMethod = 'pdf-parse'
    } else if (isDocx) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      extractedText = (result.value || '').trim()
      extractionMethod = 'mammoth'
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error('[cv-parse] text extraction failed:', msg)
    await logHistory({
      status: 'error',
      member_id: memberId,
      text_length: 0,
      error_message: `extraction_failed: ${msg}`,
    })
    return errorResponse('M6_PARSER_FAILED', 'Could not extract text from CV', 500)
  }

  extractedText = extractedText.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n')

  if (extractedText.length < MIN_CV_TEXT_CHARS) {
    await logHistory({
      status: 'error',
      member_id: memberId,
      text_length: extractedText.length,
      error_message: 'cv_text_too_short',
    })
    return errorResponse(
      'M6_CV_TEXT_TOO_SHORT',
      'We could not read enough text from your CV. Please upload a text-based PDF or .docx (not a scanned image). If your CV is a photo or scan, export it as text first.',
      422
    )
  }

  if (extractedText.length > MAX_CV_TEXT_CHARS) {
    extractedText = extractedText.slice(0, MAX_CV_TEXT_CHARS)
  }

  // Anthropic call
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let response
  try {
    response = await anthropic.messages.create({
      model: PARSER_MODEL,
      max_tokens: PARSER_MAX_TOKENS,
      temperature: PARSER_TEMPERATURE,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: extractedText }],
    })
  } catch (err: any) {
    const isTimeout = err?.name === 'TimeoutError' || err?.code === 'ETIMEDOUT'
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error('[cv-parse] Anthropic call failed:', msg)
    await logHistory({
      status: 'error',
      member_id: memberId,
      text_length: extractedText.length,
      error_message: `anthropic_failed: ${msg}`,
    })
    return errorResponse(
      isTimeout ? 'M6_PARSER_TIMEOUT' : 'M6_PARSER_FAILED',
      isTimeout ? 'CV parsing timed out' : 'CV parsing failed',
      isTimeout ? 504 : 500
    )
  }

  // Type guard on response content
  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    await logHistory({
      status: 'error',
      member_id: memberId,
      text_length: extractedText.length,
      error_message: 'no_text_block_in_response',
    })
    return errorResponse('M6_PARSER_FAILED', 'CV parsing returned unusable response', 500)
  }

  // JSON extraction (strip fences) — explicit failure on malformed JSON
  let parsed: unknown
  try {
    const cleaned = textBlock.text
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim()
    parsed = JSON.parse(cleaned)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error('[cv-parse] JSON.parse failed:', msg)
    await logHistory({
      status: 'error',
      member_id: memberId,
      text_length: extractedText.length,
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      error_message: `json_parse_failed: ${msg}`,
    })
    return errorResponse('M6_PARSER_FAILED', 'CV parser returned malformed JSON', 500)
  }

  // Zod validation — explicit failure on schema violation, no degraded payload
  const validation = CvParsedDataSchema.safeParse(parsed)
  if (!validation.success) {
    console.error('[cv-parse] Zod validation failed:', validation.error.flatten())
    await logHistory({
      status: 'error',
      member_id: memberId,
      text_length: extractedText.length,
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      error_message: `zod_validation_failed: ${JSON.stringify(validation.error.flatten()).slice(0, 500)}`,
    })
    return errorResponse(
      'M6_PARSER_INVALID_OUTPUT',
      'CV parser returned an output that did not match the expected schema',
      500
    )
  }

  const validated = validation.data

  // Sanitization
  // Drop experience rows that have neither company nor job_title (totally empty rows)
  const filteredExperiences = validated.experiences.filter(
    (e) => (e.company && e.company.trim()) || (e.job_title && e.job_title.trim())
  )

  // Sort experiences by start_date desc
  const sortedExperiences = [...filteredExperiences].sort((a, b) => {
    const aKey = a.start_date || ''
    const bKey = b.start_date || ''
    return bKey.localeCompare(aKey)
  })

  // Drop education rows that have NO useful field at all.
  // Keep the row if any of: institution, degree_level, field_of_study, city, country, start_year, graduation_year is present.
  const filteredEducation = validated.education.filter(
    (e) =>
      (e.institution && e.institution.trim()) ||
      (e.degree_level && e.degree_level.trim()) ||
      (e.field_of_study && e.field_of_study.trim()) ||
      (e.city && e.city.trim()) ||
      (e.country && e.country.trim()) ||
      e.start_year !== null ||
      e.graduation_year !== null
  )

  // Dedup needs_review
  const seen = new Set<string>()
  const dedupNeedsReview = validated.needs_review.filter((nr) => {
    const key = `${nr.section}|${nr.index}|${nr.field}|${nr.reason}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Compose final payload
  const fileName = cvPath.split('/').pop() || ''
  const fileType: 'pdf' | 'docx' = isPdf ? 'pdf' : 'docx'

  const finalPayload = {
    schema_version: SCHEMA_VERSION,
    parsed_at: new Date().toISOString(),
    source: {
      file_name: fileName,
      file_type: fileType,
      cv_storage_path: cvPath,
      extraction_method: extractionMethod,
    },
    identity: validated.identity,
    experiences: sortedExperiences,
    education: filteredEducation,
    sectors: validated.sectors,
    languages: validated.languages,
    availability: null,
    confidence: validated.confidence,
    needs_review: dedupNeedsReview,
  }

  // Storage: write only cv_parsed_data, cv_parsed_at, updated_at
  // NEVER touches cv_url, member_documents, or member-cvs bucket
  const { error: updErr } = await supabase
    .from('members')
    .update({
      cv_parsed_data: finalPayload,
      cv_parsed_at: finalPayload.parsed_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', memberId)

  if (updErr) {
    console.error('[cv-parse] members update failed:', updErr)
    await logHistory({
      status: 'error',
      member_id: memberId,
      text_length: extractedText.length,
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      error_message: `db_update_failed: ${updErr.message}`,
    })
    return errorResponse('M6_PARSER_FAILED', 'Failed to persist parsed CV data', 500)
  }

  // Logging success
  const tokensUsed = response.usage.input_tokens + response.usage.output_tokens
  const costUsd =
    response.usage.input_tokens * HAIKU_4_5_INPUT_COST_PER_TOKEN +
    response.usage.output_tokens * HAIKU_4_5_OUTPUT_COST_PER_TOKEN

  await logHistory({
    status: 'success',
    member_id: memberId,
    text_length: extractedText.length,
    tokens_used: tokensUsed,
    cost_usd: costUsd,
  })

  return NextResponse.json({
    success: true,
    cached: false,
    parsed: finalPayload,
    parsed_at: finalPayload.parsed_at,
    needs_review_count: finalPayload.needs_review.length,
  })
}
