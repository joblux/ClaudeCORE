import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Auth: admin session OR internal key
  const internalKey = req.headers.get('x-internal-key')
  const isInternal = internalKey && internalKey === process.env.NEXTAUTH_SECRET

  if (!isInternal) {
    const session = await getServerSession(authOptions)
    const isAdmin = (session?.user as any)?.role === 'admin'
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { member_id } = await req.json()
    if (!member_id) return NextResponse.json({ error: 'member_id required' }, { status: 400 })

    // Fetch member data
    const { data: member, error: memberErr } = await supabase
      .from('members')
      .select('*')
      .eq('id', member_id)
      .single()

    if (memberErr || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Fetch sectors and domains
    const [sectorsRes, domainsRes] = await Promise.all([
      supabase.from('member_sectors').select('sector, rank').eq('member_id', member_id).order('rank'),
      supabase.from('member_domains').select('domain, rank').eq('member_id', member_id).order('rank'),
    ])

    const sectorsRanked = (sectorsRes.data || []).map((s: any) => `${s.rank}. ${s.sector}`).join(', ')
    const domainsRanked = (domainsRes.data || []).map((d: any) => `${d.rank}. ${d.domain}`).join(', ')

    // Build the prompt (include the full system prompt from the spec)
    const systemPrompt = `You are an expert luxury industry recruiter reviewing membership applications for JOBLUX, an exclusive society for premium-to-ultra-luxury professionals.

Your task: assess whether this applicant has a genuine connection to the luxury industry.

IMPORTANT CONTEXT ABOUT LUXURY:
- Luxury is deeply transversal — it spans fashion & leather goods, haute couture, watches & jewellery, automotive (Rolls-Royce, Bentley, Ferrari, Bugatti), hospitality (Palace hotels, Aman, Four Seasons), beauty & fragrance, spirits & fine dining (Dom Pérignon, Hennessy, Michelin-starred), aviation & yachts, art & auction houses (Christie's, Sotheby's), real estate, design, media, and technology for luxury
- Career paths are non-linear. Someone may have worked at mass-market brands (Zara, H&M, Gap, Uniqlo) before moving into luxury (Chanel, LVMH, Kering, Richemont). A CV that shows Zara THEN Chanel is a legitimate luxury career progression. Judge the FULL trajectory, not one line
- Students at luxury-focused schools are legitimate: Polimoda, ESSEC Luxury Chair, Bocconi, IFM (Institut Français de la Mode), Glion, EHL, Parsons, Central Saint Martins, LCF, Marangoni, ISML, Sup de Luxe, etc.
- Consultants and freelancers may not have a maison name but can be deeply embedded in luxury
- Geographic context matters — Paris, Milan, London, New York, Dubai, Tokyo, Hong Kong, Seoul, Shanghai, Monaco, Geneva, Florence, Munich are luxury hubs
- Job titles vary widely across cultures and companies
- Many luxury brands are niche but legitimate: Berluti, Moynat, Goyard, Richard Mille, Graff, Van Cleef & Arpels, Brunello Cucinelli, Loro Piana, Brioni, Audemars Piguet, Vacheron Constantin, Patek Philippe, A. Lange & Söhne, Buccellati, etc.
- Luxury groups: LVMH, Kering, Richemont, Hermès, Chanel, Prada Group, Tapestry, Capri Holdings, Puig, Swatch Group, Rolex
- Sectors and domains ranked by preference — #1 is most important signal

MEMBER APPLICATION:
Tier: ${member.role}
Name: ${member.full_name || [member.first_name, member.last_name].filter(Boolean).join(' ')}
City: ${member.city || 'N/A'}, Country: ${member.country || 'N/A'}
Sectors (ranked): ${sectorsRanked || 'N/A'}
Domains (ranked): ${domainsRanked || 'N/A'}
Job Title: ${member.job_title || 'N/A'}
Maison/Employer: ${member.maison || 'N/A'}
Seniority: ${member.seniority || 'N/A'}
Years in Luxury: ${member.years_in_luxury || 'N/A'}
Department: ${member.department || 'N/A'}
University: ${member.university || 'N/A'}
Field of Study: ${member.field_of_study || 'N/A'}
Seeking Role: ${member.seeking_role || 'N/A'}
Speciality: ${member.speciality || 'N/A'}
Firm: ${member.consulting_firm || 'N/A'}
Expertise Tags: ${(member.expertise_tags || []).join(', ') || 'N/A'}
Company Email: ${member.company_email || 'N/A'}
Company Website: ${member.company_website || 'N/A'}
Company Size: ${member.company_size || 'N/A'}

Respond ONLY with valid JSON, no markdown, no preamble:
{"confidence": "high" | "medium" | "low", "reasoning": "1-2 sentence explanation", "recommendation": "approve" | "review"}

Rules:
- HIGH + approve: clearly a luxury professional
- MEDIUM + review: some indicators but ambiguous
- LOW + review: no clear luxury connection
- Never recommend approve for Business or Insider tier — max MEDIUM + review
- Be generous but not naive`

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.WIKILUX_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: systemPrompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Claude API error:', errText)
      return NextResponse.json({ error: 'AI review failed' }, { status: 500 })
    }

    const aiResponse = await response.json()
    const text = aiResponse.content?.[0]?.text || ''

    // Parse JSON from response
    let review: { confidence: string; reasoning: string; recommendation: string }
    try {
      review = JSON.parse(text)
    } catch {
      // Try to extract JSON from text
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        review = JSON.parse(match[0])
      } else {
        review = { confidence: 'medium', reasoning: 'AI response could not be parsed', recommendation: 'review' }
      }
    }

    // Determine auto-approval
    const autoApproveTiers = ['rising', 'pro', 'professional', 'executive']
    const shouldAutoApprove = review.confidence === 'high' && review.recommendation === 'approve' && autoApproveTiers.includes(member.role)

    // Upsert review
    await supabase.from('member_ai_reviews').upsert({
      member_id: member_id,
      confidence: review.confidence,
      reasoning: review.reasoning,
      recommendation: review.recommendation,
      auto_approved: shouldAutoApprove,
      model_used: 'claude-sonnet-4-20250514',
      created_at: new Date().toISOString(),
    }, { onConflict: 'member_id' })

    // Auto-approve if high confidence
    if (shouldAutoApprove) {
      await supabase.from('members').update({
        status: 'approved',
        approved_by: 'ai_auto',
        approved_at: new Date().toISOString(),
      }).eq('id', member_id)
    }

    return NextResponse.json({
      confidence: review.confidence,
      reasoning: review.reasoning,
      recommendation: review.recommendation,
      auto_approved: shouldAutoApprove,
    })
  } catch (err: any) {
    console.error('AI review error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
