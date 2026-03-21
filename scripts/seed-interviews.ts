import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// Verify env
const required = ['ANTHROPIC_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
for (const key of required) {
  if (!process.env[key]) { console.error(`Missing env var: ${key}`); process.exit(1) }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface InterviewSpec {
  brand: string
  brandSlug: string
  roles: string[]
}

const BRANDS_TO_SEED: InterviewSpec[] = [
  { brand: 'Louis Vuitton', brandSlug: 'louis-vuitton', roles: ['Client Advisor', 'Store Manager', 'CRM Manager'] },
  { brand: 'Chanel', brandSlug: 'chanel', roles: ['Client Advisor', 'Store Manager', 'Visual Merchandiser'] },
  { brand: 'Hermès', brandSlug: 'hermes', roles: ['Client Advisor', 'Store Manager'] },
  { brand: 'Dior', brandSlug: 'dior', roles: ['Client Advisor', 'Marketing Manager', 'Brand Manager'] },
  { brand: 'Gucci', brandSlug: 'gucci', roles: ['Client Advisor', 'Store Manager', 'Visual Merchandiser'] },
  { brand: 'Cartier', brandSlug: 'cartier', roles: ['Client Advisor', 'Store Manager'] },
  { brand: 'Rolex', brandSlug: 'rolex', roles: ['Client Advisor', 'Store Manager'] },
  { brand: 'Burberry', brandSlug: 'burberry', roles: ['Store Manager', 'CRM Manager'] },
  { brand: 'Prada', brandSlug: 'prada', roles: ['Client Advisor', 'Brand Manager'] },
  { brand: 'Tiffany & Co.', brandSlug: 'tiffany-co', roles: ['Client Advisor', 'Store Manager'] },
  { brand: 'Bulgari', brandSlug: 'bulgari', roles: ['Client Advisor', 'Marketing Manager'] },
  { brand: 'Van Cleef & Arpels', brandSlug: 'van-cleef-arpels', roles: ['Client Advisor', 'Store Manager'] },
]

async function main() {
  console.log('Interview Intelligence Seeding')
  console.log('==============================')

  // Build list of all interview specs
  const specs: { brand: string; brandSlug: string; role: string }[] = []
  for (const b of BRANDS_TO_SEED) {
    for (const role of b.roles) {
      specs.push({ brand: b.brand, brandSlug: b.brandSlug, role })
    }
  }

  console.log(`Interview experiences to generate: ${specs.length}`)
  console.log('')

  // Get admin member_id for contributions (member_id is NOT NULL)
  const { data: admin } = await supabase
    .from('members')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()

  if (!admin) {
    console.error('No admin member found in members table. Cannot create contributions.')
    process.exit(1)
  }
  console.log(`Using admin member_id: ${admin.id}`)
  console.log('')

  let success = 0
  const failed: string[] = []

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i]
    const label = `[${i + 1}/${specs.length}]`

    try {
      process.stdout.write(`${label} ${spec.brand} — ${spec.role}... `)

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Generate a realistic interview experience for a luxury industry job. This should read like a real anonymous contribution from someone who interviewed at this company.

Brand: ${spec.brand}
Role: ${spec.role}

Return ONLY valid JSON (no markdown, no backticks):
{
  "location": "city where interview took place",
  "interview_year": 2025,
  "department": "department name (Retail, Marketing, CRM, Visual Merchandising, etc.)",
  "seniority": "junior|mid-level|senior|director",
  "process_duration": "e.g. 2 weeks, 1 month",
  "number_of_rounds": 3,
  "interview_format": "In-person|Video|Phone + In-person|Multi-stage",
  "process_description": "3-5 sentences describing the full interview process, stages, and what happened",
  "questions_asked": ["realistic interview question 1", "question 2", "question 3", "question 4"],
  "tips": ["practical tip for candidates 1", "tip 2", "tip 3"],
  "outcome": "offered|rejected|withdrew",
  "difficulty": "easy|moderate|challenging",
  "overall_experience": "positive|neutral|negative"
}

Make it specific, realistic, and useful for luxury job seekers. Vary the outcomes and experiences naturally.`
        }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      const exp = JSON.parse(cleaned)

      // First create a contribution record (parent)
      const { data: contrib, error: contribError } = await supabase
        .from('contributions')
        .insert({
          member_id: admin.id,
          contribution_type: 'interview_experience',
          brand_slug: spec.brandSlug,
          brand_name: spec.brand,
          is_anonymous: true,
          status: 'approved',
          points_awarded: 5,
        })
        .select('id')
        .single()

      if (contribError) throw new Error(`Contribution insert: ${contribError.message}`)

      // Validate enum values against DB check constraints (all lowercase)
      const validDifficulty = ['easy', 'moderate', 'challenging']
      const validOutcome = ['offered', 'rejected', 'withdrew', 'pending']
      const validExperience = ['positive', 'neutral', 'negative']
      const validSeniority = ['junior', 'mid-level', 'senior', 'director']

      const difficulty = validDifficulty.includes(exp.difficulty?.toLowerCase()) ? exp.difficulty.toLowerCase() : 'moderate'
      const outcome = validOutcome.includes(exp.outcome?.toLowerCase()) ? exp.outcome.toLowerCase() : 'rejected'
      const overallExperience = validExperience.includes(exp.overall_experience?.toLowerCase()) ? exp.overall_experience.toLowerCase() : 'neutral'
      const seniority = validSeniority.includes(exp.seniority?.toLowerCase()) ? exp.seniority.toLowerCase() : 'mid-level'

      // Then create the interview_experience linked to it
      const { error: expError } = await supabase
        .from('interview_experiences')
        .insert({
          contribution_id: contrib.id,
          job_title: spec.role,
          department: exp.department || 'Retail',
          seniority,
          location: exp.location || 'Paris',
          interview_year: exp.interview_year || 2025,
          process_duration: exp.process_duration || null,
          number_of_rounds: exp.number_of_rounds || null,
          interview_format: exp.interview_format || null,
          process_description: exp.process_description || '',
          questions_asked: exp.questions_asked || [],
          tips: exp.tips || [],
          outcome,
          difficulty,
          overall_experience: overallExperience,
        })

      if (expError) throw new Error(`Experience insert: ${expError.message}`)

      console.log('saved')
      success++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`FAILED: ${msg}`)
      failed.push(`${spec.brand} — ${spec.role}`)
    }

    // 2s delay
    if (i < specs.length - 1) {
      await new Promise((r) => setTimeout(r, 2000))
    }
  }

  console.log('')
  console.log('Interview Seeding Complete')
  console.log('=========================')
  console.log(`${success} generated, ${failed.length} failed`)
  if (failed.length > 0) {
    console.log(`Failed: ${failed.join(', ')}`)
  }
}

main().catch((err) => { console.error('Fatal error:', err); process.exit(1) })
