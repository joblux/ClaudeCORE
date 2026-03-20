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

// Maximum number of assignments to enrich in one request (to manage AI costs)
const MAX_ENRICHMENT_BATCH = 5

const ENRICHMENT_SYSTEM_PROMPT = `You are a luxury recruitment specialist. Given job data, enrich it:
1. Infer product_category from description (array of: Leather Goods, Ready-to-Wear, Haute Couture, Shoes, Jewellery, Watches, Fragrance, Beauty / Cosmetics, Eyewear, Home & Lifestyle, Wine & Spirits, Hospitality, Automotive, Yachting / Aviation, Art & Culture)
2. Infer client_segment from seniority and maison
3. Infer luxury_sector_experience from requirements
4. Extract languages_required from description/requirements
5. Match company name to luxury brands (Chanel, Hermès, Louis Vuitton, Dior, Gucci, Prada, Cartier, Bulgari, Rolex, etc.)
6. Standardize department to one of: Retail, E-commerce, Marketing & Communications, Merchandising, Buying, Design & Creative, Product Development, Supply Chain & Logistics, Finance & Administration, Human Resources, IT & Digital, Legal & Compliance, Client Relations (CRM), Visual Merchandising, Store Operations, Wholesale, PR & Events, Sustainability, Executive / General Management, Other
7. Standardize seniority to: Intern/Trainee, Junior (0–2 yrs), Mid-level (3–5 yrs), Senior (6–10 yrs), Lead / Manager, Director, VP / Head of, C-Suite / Executive, Board / Advisory
8. Standardize contract_type to: Permanent (CDI), Fixed-term (CDD), Freelance / Consultant, Temporary / Seasonal, Internship (Stage), Apprenticeship, Part-time, Executive Interim
Return JSON with the enriched/standardized fields only.`

/**
 * Enrich a single assignment using Claude AI.
 */
async function enrichAssignment(assignment: Record<string, any>): Promise<Record<string, any>> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: ENRICHMENT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: JSON.stringify(assignment) }],
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

  return JSON.parse(jsonText)
}

/**
 * POST /api/assignments/import/enrich
 *
 * Accepts { assignments: object[] }. Admin only.
 * Uses Claude AI to enrich assignments with luxury-specific metadata:
 * product categories, standardized departments, seniority levels, etc.
 *
 * Processes a maximum of 5 assignments per request to manage API costs.
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authorization check
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assignments } = body

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ error: 'No assignments provided' }, { status: 400 })
    }

    // Limit batch size to control costs
    const batch = assignments.slice(0, MAX_ENRICHMENT_BATCH)
    const enriched: { original: Record<string, any>; enrichments: Record<string, any> }[] = []
    const errors: { index: number; error: string }[] = []

    // Process assignments sequentially to avoid rate limits
    for (let i = 0; i < batch.length; i++) {
      try {
        const enrichments = await enrichAssignment(batch[i])
        enriched.push({
          original: batch[i],
          enrichments,
        })
      } catch (error: any) {
        console.error(`Enrichment error for assignment ${i}:`, error)
        errors.push({
          index: i,
          error: error.message || 'Failed to enrich assignment',
        })
        // Still include the original without enrichments
        enriched.push({
          original: batch[i],
          enrichments: {},
        })
      }
    }

    return NextResponse.json({
      enriched,
      errors,
      total_requested: assignments.length,
      total_processed: batch.length,
      ...(assignments.length > MAX_ENRICHMENT_BATCH && {
        warning: `Only the first ${MAX_ENRICHMENT_BATCH} assignments were enriched. Submit remaining assignments in subsequent requests.`,
      }),
    })
  } catch (error: any) {
    console.error('Enrich import error:', error)
    return NextResponse.json(
      { error: 'Failed to enrich assignments', details: error.message },
      { status: 500 }
    )
  }
}
