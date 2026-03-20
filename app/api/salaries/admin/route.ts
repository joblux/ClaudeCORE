import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseInt(sp.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '50')))
    const offset = (page - 1) * limit

    const db = supabaseAdmin() as any
    const { data, count, error } = await db
      .from('salary_benchmarks')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ benchmarks: data || [], total: count || 0, page, limit })
  } catch (err) {
    console.error('Admin salary API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const db = supabaseAdmin() as any

    // Support bulk import (array) or single entry
    const entries = Array.isArray(body) ? body : [body]

    const insertData = entries.map((e: any) => ({
      brand_name: e.brand_name,
      brand_slug: e.brand_slug || null,
      job_title: e.job_title,
      department: e.department || null,
      seniority: e.seniority || null,
      city: e.city,
      country: e.country,
      currency: e.currency || 'EUR',
      salary_min: e.salary_min,
      salary_max: e.salary_max,
      salary_median: e.salary_median || null,
      bonus_min: e.bonus_min || null,
      bonus_max: e.bonus_max || null,
      total_comp_min: e.total_comp_min || null,
      total_comp_max: e.total_comp_max || null,
      source: e.source || 'admin_curated',
      source_url: e.source_url || null,
      confidence: e.confidence || 'verified',
      year_of_data: e.year_of_data || new Date().getFullYear(),
      notes: e.notes || null,
    }))

    const { data, error } = await db
      .from('salary_benchmarks')
      .insert(insertData)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ created: data?.length || 0, benchmarks: data }, { status: 201 })
  } catch (err) {
    console.error('Admin salary POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
