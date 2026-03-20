import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/messages/templates/render
 * Render a template by replacing {{field}} placeholders with merge data values.
 * Returns the rendered subject and body.
 * Admin only.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { template_id, merge_data } = body as {
      template_id: string
      merge_data: Record<string, string>
    }

    if (!template_id) {
      return NextResponse.json({ error: 'template_id is required' }, { status: 400 })
    }

    // Fetch the template
    const { data: template, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', template_id)
      .single()

    if (error || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Replace all {{field}} placeholders with merge_data values
    const replacePlaceholders = (text: string | null): string => {
      if (!text) return ''
      return text.replace(/\{\{(\w+)\}\}/g, (match, field) => {
        return merge_data?.[field] ?? ''
      })
    }

    const renderedSubject = replacePlaceholders(template.subject)
    const renderedBody = replacePlaceholders(template.body)

    return NextResponse.json({
      subject: renderedSubject,
      body: renderedBody,
    })
  } catch (err) {
    console.error('Unexpected error rendering template:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
