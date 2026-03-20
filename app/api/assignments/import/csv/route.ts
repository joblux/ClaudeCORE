import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Papa from 'papaparse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Fuzzy field mappings from common CSV headers to JOBLUX assignment fields
const FIELD_MAPPINGS: Record<string, string> = {
  // title
  'job title': 'title', 'title': 'title', 'position': 'title', 'role': 'title', 'position title': 'title',
  // maison
  'company': 'maison', 'organization': 'maison', 'employer': 'maison', 'maison': 'maison', 'brand': 'maison', 'hiring organization': 'maison', 'maison/company': 'maison',
  // city
  'city': 'city', 'location': 'city',
  // country
  'country': 'country',
  // description
  'description': 'description', 'job description': 'description', 'summary': 'description', 'about the role': 'description',
  // responsibilities
  'responsibilities': 'responsibilities', 'key responsibilities': 'responsibilities', 'duties': 'responsibilities',
  // requirements
  'requirements': 'requirements', 'qualifications': 'requirements', 'required skills': 'requirements',
  // nice_to_haves
  'nice to haves': 'nice_to_haves', 'preferred': 'nice_to_haves', 'desirable': 'nice_to_haves',
  // department
  'department': 'department', 'function': 'department', 'team': 'department',
  // seniority
  'seniority': 'seniority', 'seniority level': 'seniority', 'level': 'seniority', 'experience level': 'seniority',
  // contract_type
  'contract': 'contract_type', 'contract type': 'contract_type', 'employment type': 'contract_type', 'type': 'contract_type',
  // remote_policy
  'remote': 'remote_policy', 'work model': 'remote_policy', 'remote policy': 'remote_policy',
  // salary
  'salary min': 'salary_min', 'salary max': 'salary_max', 'salary currency': 'salary_currency', 'salary period': 'salary_period',
  'salary': 'salary_min', 'compensation': 'salary_min', 'salary range': 'salary_min',
  // others
  'benefits': 'benefits', 'languages': 'languages_required', 'languages required': 'languages_required',
  'product category': 'product_category', 'reports to': 'reports_to', 'team size': 'team_size',
  'start date': 'start_date', 'relocation offered': 'relocation_offered', 'visa sponsorship': 'visa_sponsorship',
}

/**
 * POST /api/assignments/import/csv
 *
 * Accepts multipart form data with a CSV file.
 * Parses the CSV, auto-maps columns to JOBLUX fields using fuzzy matching,
 * and returns a preview of the parsed data with mapping suggestions.
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authorization check
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file content as text
    const fileText = await file.text()

    if (!fileText.trim()) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 })
    }

    // Parse CSV with PapaParse
    const parseResult = Papa.parse(fileText, {
      header: true,
      skipEmptyLines: true,
    })

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse CSV', details: parseResult.errors },
        { status: 400 }
      )
    }

    const rows = parseResult.data as Record<string, any>[]
    const columns = parseResult.meta.fields || []

    // Auto-map columns using fuzzy matching
    const mappings: Record<string, string> = {}
    const unmapped: string[] = []

    for (const column of columns) {
      const normalizedColumn = column.toLowerCase().trim()
      const matchedField = FIELD_MAPPINGS[normalizedColumn]

      if (matchedField) {
        mappings[column] = matchedField
      } else {
        unmapped.push(column)
      }
    }

    return NextResponse.json({
      rows,
      columns,
      mappings,
      unmapped,
      total: rows.length,
    })
  } catch (error: any) {
    console.error('CSV import error:', error)
    return NextResponse.json(
      { error: 'Failed to process CSV file', details: error.message },
      { status: 500 }
    )
  }
}
