import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Field mappings for auto-mapping JSON keys to JOBLUX fields
const FIELD_MAPPINGS: Record<string, string> = {
  'job title': 'title', 'title': 'title', 'position': 'title', 'role': 'title', 'position title': 'title',
  'company': 'maison', 'organization': 'maison', 'employer': 'maison', 'maison': 'maison', 'brand': 'maison', 'hiring organization': 'maison', 'maison/company': 'maison',
  'city': 'city', 'location': 'city',
  'country': 'country',
  'description': 'description', 'job description': 'description', 'summary': 'description', 'about the role': 'description',
  'responsibilities': 'responsibilities', 'key responsibilities': 'responsibilities', 'duties': 'responsibilities',
  'requirements': 'requirements', 'qualifications': 'requirements', 'required skills': 'requirements',
  'nice to haves': 'nice_to_haves', 'preferred': 'nice_to_haves', 'desirable': 'nice_to_haves',
  'department': 'department', 'function': 'department', 'team': 'department',
  'seniority': 'seniority', 'seniority level': 'seniority', 'level': 'seniority', 'experience level': 'seniority',
  'contract': 'contract_type', 'contract type': 'contract_type', 'employment type': 'contract_type', 'type': 'contract_type',
  'remote': 'remote_policy', 'work model': 'remote_policy', 'remote policy': 'remote_policy',
  'salary min': 'salary_min', 'salary max': 'salary_max', 'salary currency': 'salary_currency', 'salary period': 'salary_period',
  'salary': 'salary_min', 'compensation': 'salary_min', 'salary range': 'salary_min',
  'benefits': 'benefits', 'languages': 'languages_required', 'languages required': 'languages_required',
  'product category': 'product_category', 'reports to': 'reports_to', 'team size': 'team_size',
  'start date': 'start_date', 'relocation offered': 'relocation_offered', 'visa sponsorship': 'visa_sponsorship',
}

/**
 * Parse a Schema.org JobPosting object into JOBLUX format.
 */
function parseSchemaOrgJobPosting(data: any): Record<string, any> {
  const job: Record<string, any> = {}

  job.title = data.title || null
  job.description = data.description || null

  // hiringOrganization can be a string or object
  if (typeof data.hiringOrganization === 'string') {
    job.maison = data.hiringOrganization
  } else if (data.hiringOrganization?.name) {
    job.maison = data.hiringOrganization.name
  }

  // jobLocation can be a string, object, or array
  if (data.jobLocation) {
    const location = Array.isArray(data.jobLocation) ? data.jobLocation[0] : data.jobLocation
    if (typeof location === 'string') {
      job.city = location
    } else if (location?.address) {
      const address = typeof location.address === 'string' ? { addressLocality: location.address } : location.address
      job.city = address.addressLocality || address.addressRegion || null
      job.country = address.addressCountry || null
    }
  }

  // baseSalary
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

  // employmentType
  job.contract_type = data.employmentType || null

  // Additional Schema.org fields
  job.date_posted = data.datePosted || null
  job.valid_through = data.validThrough || null
  job.responsibilities = data.responsibilities || null
  job.requirements = data.qualifications || data.experienceRequirements || null
  job.department = data.occupationalCategory || null
  job.seniority = data.experienceRequirements?.monthsOfExperience ? null : (data.experienceRequirements || null)
  job.benefits = data.jobBenefits || null

  return job
}

/**
 * Parse HR-JSON PositionProfile format.
 */
function parseHRJSON(data: any): Record<string, any>[] {
  const jobs: Record<string, any>[] = []

  const profiles = Array.isArray(data.PositionProfile) ? data.PositionProfile : [data.PositionProfile || data]

  for (const profile of profiles) {
    const job: Record<string, any> = {}
    job.title = profile.PositionTitle || profile.positionTitle || null
    job.description = profile.PositionDescription || profile.positionDescription || profile.Description || null
    job.maison = profile.OrganizationName || profile.organizationName || null
    job.city = profile.CityName || profile.cityName || null
    job.country = profile.CountryCode || profile.countryCode || null
    job.department = profile.JobCategory || profile.jobCategory || null
    job.requirements = profile.QualificationsRequired || profile.qualificationsRequired || null
    jobs.push(job)
  }

  return jobs
}

/**
 * Auto-map a generic JSON object's keys to JOBLUX fields.
 */
function autoMapObject(obj: Record<string, any>): Record<string, any> {
  const mapped: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    // Skip nested objects (except arrays which could be benefits/languages)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) continue

    const normalizedKey = key.toLowerCase().replace(/[_-]/g, ' ').trim()
    const mappedField = FIELD_MAPPINGS[normalizedKey]
    if (mappedField) {
      mapped[mappedField] = value
    } else {
      mapped[key] = value
    }
  }

  return mapped
}

/**
 * POST /api/assignments/import/json
 *
 * Accepts a JSON file upload or JSON body. Detects the format
 * (Schema.org JobPosting, HR-JSON, or generic) and maps to JOBLUX fields.
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authorization check
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let data: any

    // Try to parse as multipart form data (file upload) or JSON body
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }
      const fileText = await file.text()
      if (!fileText.trim()) {
        return NextResponse.json({ error: 'File is empty' }, { status: 400 })
      }
      try {
        data = JSON.parse(fileText)
      } catch {
        return NextResponse.json({ error: 'Invalid JSON in file' }, { status: 400 })
      }
    } else {
      try {
        data = await request.json()
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
      }
    }

    let rows: Record<string, any>[] = []
    let format = 'generic'

    // Detect Schema.org JobPosting format
    if (data['@type'] === 'JobPosting' || data.type === 'JobPosting') {
      format = 'schema-org'
      rows = [parseSchemaOrgJobPosting(data)]
    }
    // Schema.org array (e.g., from a job board feed)
    else if (Array.isArray(data) && data.length > 0 && (data[0]['@type'] === 'JobPosting' || data[0].type === 'JobPosting')) {
      format = 'schema-org'
      rows = data.map(parseSchemaOrgJobPosting)
    }
    // HR-JSON format
    else if (data.PositionProfile || data.positionProfile) {
      format = 'hr-json'
      rows = parseHRJSON(data)
    }
    // Generic array of objects
    else if (Array.isArray(data)) {
      format = 'generic-array'
      rows = data.map(autoMapObject)
    }
    // Single generic object — wrap in array
    else if (typeof data === 'object' && data !== null) {
      format = 'generic-object'
      rows = [autoMapObject(data)]
    } else {
      return NextResponse.json({ error: 'Unrecognized JSON format' }, { status: 400 })
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No job data found in JSON', format },
        { status: 400 }
      )
    }

    // Collect all unique columns across all rows
    const columnSet = new Set<string>()
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        columnSet.add(key)
      }
    }
    const columns = Array.from(columnSet)

    // Build mappings
    const jobluxFields = new Set(Object.values(FIELD_MAPPINGS))
    const mappings: Record<string, string> = {}
    const unmapped: string[] = []

    for (const column of columns) {
      if (jobluxFields.has(column)) {
        mappings[column] = column
      } else {
        const normalizedColumn = column.toLowerCase().replace(/[_-]/g, ' ').trim()
        const matchedField = FIELD_MAPPINGS[normalizedColumn]
        if (matchedField) {
          mappings[column] = matchedField
        } else {
          unmapped.push(column)
        }
      }
    }

    return NextResponse.json({
      rows,
      columns,
      mappings,
      unmapped,
      total: rows.length,
      format,
    })
  } catch (error: any) {
    console.error('JSON import error:', error)
    return NextResponse.json(
      { error: 'Failed to process JSON data', details: error.message },
      { status: 500 }
    )
  }
}
