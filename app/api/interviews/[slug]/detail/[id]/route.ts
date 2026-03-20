import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { ACCESS_LEVELS } from '@/types/interview'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json(
        { error: 'Sign in to view interview details' },
        { status: 401 }
      )
    }

    const { slug, id } = params
    const db = supabaseAdmin()

    // Get member's access level
    const { data: member } = await db
      .from('members' as any)
      .select('access_level')
      .eq('id', session.user.memberId)
      .single()

    const accessLevel = (member as any)?.access_level || 'basic'
    const accessRank = ACCESS_LEVELS[accessLevel] ?? 0

    if (accessRank < ACCESS_LEVELS['standard']) {
      return NextResponse.json(
        {
          error: 'Contribute to unlock interview details',
          required_level: 'standard',
          current_level: accessLevel,
        },
        { status: 403 }
      )
    }

    // Fetch the experience
    const { data: rawExpData, error } = await db
      .from('interview_experiences' as any)
      .select(`
        id,
        job_title,
        department,
        seniority,
        location,
        interview_year,
        process_duration,
        number_of_rounds,
        interview_format,
        process_description,
        questions_asked,
        tips,
        outcome,
        difficulty,
        overall_experience,
        created_at,
        contributions!inner (
          id,
          brand_name,
          brand_slug,
          is_anonymous,
          status,
          contribution_type
        )
      `)
      .eq('id', id)
      .eq('contributions.status', 'approved')
      .eq('contributions.contribution_type', 'interview_experience')
      .eq('contributions.brand_slug', slug)
      .single()

    if (error || !rawExpData) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
    }

    const rawExp = rawExpData as any
    const contrib = Array.isArray(rawExp.contributions)
      ? rawExp.contributions[0]
      : rawExp.contributions

    // Build response based on access level
    const experience: Record<string, any> = {
      id: rawExp.id,
      brand_name: contrib?.brand_name || '',
      brand_slug: contrib?.brand_slug || slug,
      job_title: rawExp.job_title,
      department: rawExp.department,
      seniority: rawExp.seniority,
      location: rawExp.location,
      interview_year: rawExp.interview_year,
      process_duration: rawExp.process_duration,
      number_of_rounds: rawExp.number_of_rounds,
      interview_format: rawExp.interview_format,
      difficulty: rawExp.difficulty,
      overall_experience: rawExp.overall_experience,
      outcome: rawExp.outcome,
      is_anonymous: contrib?.is_anonymous ?? true,
      created_at: rawExp.created_at,
    }

    // Standard+ gets process_description
    if (accessRank >= ACCESS_LEVELS['standard']) {
      experience.process_description = rawExp.process_description
    }

    // Premium+ gets questions and tips
    if (accessRank >= ACCESS_LEVELS['premium']) {
      experience.questions_asked = rawExp.questions_asked
      experience.tips = rawExp.tips
    }

    return NextResponse.json({
      experience,
      access_level: accessLevel,
    })
  } catch (err) {
    console.error('Interview detail API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
