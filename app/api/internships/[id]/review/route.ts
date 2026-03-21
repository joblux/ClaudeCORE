import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId
    const role = (session?.user as any)?.role
    const isAdmin = role === 'admin'

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const body = await req.json()
    const { action, reason, notes } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject".' },
        { status: 400 }
      )
    }

    // Fetch the listing
    const { data: listing, error: fetchError } = await supabaseAdmin
      .from('internship_listings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const now = new Date().toISOString()

    if (action === 'approve') {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 90)

      const seoTitle = `${listing.title} Internship at ${listing.company_name} | ${listing.city}`
      const seoDescription = listing.description.substring(0, 155)

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: listing.title,
        description: listing.description,
        employmentType: 'INTERN',
        hiringOrganization: {
          '@type': 'Organization',
          name: listing.company_name,
          sameAs: listing.company_website || undefined,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: listing.city,
            addressCountry: listing.country,
          },
        },
        datePosted: now,
        validThrough: expiresAt.toISOString(),
      }

      const { data, error } = await supabaseAdmin
        .from('internship_listings')
        .update({
          status: 'approved',
          approved_at: now,
          expires_at: expiresAt.toISOString(),
          reviewed_by: memberId,
          reviewed_at: now,
          admin_notes: notes || null,
          seo_title: seoTitle,
          seo_description: seoDescription,
          structured_data: structuredData,
          updated_at: now,
        })
        .eq('id', params.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    // Reject
    const { data, error } = await supabaseAdmin
      .from('internship_listings')
      .update({
        status: 'rejected',
        rejection_reason: reason || null,
        admin_notes: notes || null,
        reviewed_by: memberId,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('POST /api/internships/[id]/review error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
