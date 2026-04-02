import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { XMLParser } from 'fast-xml-parser'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Same field mappings as CSV for consistency
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
 * Extract job data from HR-XML format (JobPositionPosting / PositionProfile).
 */
function parseHRXML(data: any): Record<string, any>[] {
  const jobs: Record<string, any>[] = []

  // Handle JobPositionPosting (HR-XML 2.x)
  const postings = findNestedValue(data, 'JobPositionPosting')
  if (postings) {
    const postingArray = Array.isArray(postings) ? postings : [postings]
    for (const posting of postingArray) {
      const job: Record<string, any> = {}
      job.title = findNestedValue(posting, 'JobPositionTitle') || findNestedValue(posting, 'PositionTitle') || null
      job.description = findNestedValue(posting, 'JobPositionDescription') || findNestedValue(posting, 'Description') || null
      job.maison = findNestedValue(posting, 'HiringOrgName') || findNestedValue(posting, 'OrganizationName') || null
      job.city = findNestedValue(posting, 'CityName') || findNestedValue(posting, 'Municipality') || null
      job.country = findNestedValue(posting, 'CountryCode') || findNestedValue(posting, 'Country') || null
      job.requirements = findNestedValue(posting, 'QualificationsRequired') || null
      job.department = findNestedValue(posting, 'Department') || findNestedValue(posting, 'JobCategory') || null
      jobs.push(job)
    }
    return jobs
  }

  // Handle PositionProfile (HR-XML 3.x / HR Open Standards)
  const profiles = findNestedValue(data, 'PositionProfile')
  if (profiles) {
    const profileArray = Array.isArray(profiles) ? profiles : [profiles]
    for (const profile of profileArray) {
      const job: Record<string, any> = {}
      job.title = findNestedValue(profile, 'PositionTitle') || null
      job.description = findNestedValue(profile, 'PositionDescription') || findNestedValue(profile, 'Description') || null
      job.maison = findNestedValue(profile, 'OrganizationName') || null
      job.city = findNestedValue(profile, 'CityName') || null
      job.country = findNestedValue(profile, 'CountryCode') || null
      job.department = findNestedValue(profile, 'JobCategory') || null
      jobs.push(job)
    }
    return jobs
  }

  return jobs
}

/**
 * Extract job data from LinkedIn/generic XML feed format.
 */
function parseLinkedInXML(data: any): Record<string, any>[] {
  const jobs: Record<string, any>[] = []

  // Try jobs.job or just job array
  let jobList = findNestedValue(data, 'job')
  if (!jobList) {
    const jobsNode = findNestedValue(data, 'jobs')
    if (jobsNode) {
      jobList = jobsNode.job || jobsNode
    }
  }

  if (!jobList) return jobs

  const jobArray = Array.isArray(jobList) ? jobList : [jobList]
  for (const item of jobArray) {
    const job: Record<string, any> = {}
    // Map known fields
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'object' && value !== null) continue
      const normalizedKey = key.toLowerCase().replace(/[_-]/g, ' ').trim()
      const mappedField = FIELD_MAPPINGS[normalizedKey]
      if (mappedField) {
        job[mappedField] = value
      } else {
        job[key] = value
      }
    }
    jobs.push(job)
  }

  return jobs
}

/**
 * Flatten any generic XML structure to key-value pairs per row.
 */
function parseGenericXML(data: any): Record<string, any>[] {
  const jobs: Record<string, any>[] = []

  // Find the first array-like structure in the XML
  const arrayNode = findFirstArray(data)
  if (arrayNode) {
    const items = Array.isArray(arrayNode) ? arrayNode : [arrayNode]
    for (const item of items) {
      const flattened = flattenObject(item)
      const job: Record<string, any> = {}
      for (const [key, value] of Object.entries(flattened)) {
        const normalizedKey = key.toLowerCase().replace(/[_.-]/g, ' ').trim()
        const mappedField = FIELD_MAPPINGS[normalizedKey]
        if (mappedField) {
          job[mappedField] = value
        } else {
          job[key] = value
        }
      }
      jobs.push(job)
    }
  } else {
    // Single item | flatten the whole thing
    const flattened = flattenObject(data)
    const job: Record<string, any> = {}
    for (const [key, value] of Object.entries(flattened)) {
      const normalizedKey = key.toLowerCase().replace(/[_.-]/g, ' ').trim()
      const mappedField = FIELD_MAPPINGS[normalizedKey]
      if (mappedField) {
        job[mappedField] = value
      } else {
        job[key] = value
      }
    }
    jobs.push(job)
  }

  return jobs
}

/**
 * Recursively search an object for a key and return its value.
 */
function findNestedValue(obj: any, targetKey: string): any {
  if (!obj || typeof obj !== 'object') return null

  for (const [key, value] of Object.entries(obj)) {
    if (key === targetKey) return value
    if (typeof value === 'object') {
      const found = findNestedValue(value, targetKey)
      if (found !== null) return found
    }
  }
  return null
}

/**
 * Find the first array-like node in an object tree.
 */
function findFirstArray(obj: any): any[] | null {
  if (!obj || typeof obj !== 'object') return null
  if (Array.isArray(obj) && obj.length > 0) return obj

  for (const value of Object.values(obj)) {
    if (Array.isArray(value) && value.length > 0) return value
    if (typeof value === 'object') {
      const found = findFirstArray(value)
      if (found) return found
    }
  }
  return null
}

/**
 * Flatten a nested object into dot-notation key-value pairs.
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj || {})) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey))
    } else {
      result[fullKey] = value
    }
  }
  return result
}

/**
 * POST /api/assignments/import/xml
 *
 * Accepts an XML file upload, detects the format (HR-XML, LinkedIn feed, or generic),
 * parses and maps fields to JOBLUX format, and returns a preview.
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

    const xmlText = await file.text()

    if (!xmlText.trim()) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 })
    }

    // Parse XML
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
    const result = parser.parse(xmlText)

    // Detect format and parse accordingly
    let rows: Record<string, any>[] = []
    let format = 'generic'

    if (findNestedValue(result, 'JobPositionPosting') || findNestedValue(result, 'PositionProfile')) {
      // HR-XML format
      format = 'hr-xml'
      rows = parseHRXML(result)
    } else if (findNestedValue(result, 'jobs') || findNestedValue(result, 'job')) {
      // LinkedIn/generic job feed
      format = 'linkedin-feed'
      rows = parseLinkedInXML(result)
    } else {
      // Generic XML | flatten to key-value pairs
      format = 'generic'
      rows = parseGenericXML(result)
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No job data found in XML file', format },
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

    // Build mappings: identify which columns are already mapped JOBLUX fields
    const jobluxFields = new Set(Object.values(FIELD_MAPPINGS))
    const mappings: Record<string, string> = {}
    const unmapped: string[] = []

    for (const column of columns) {
      if (jobluxFields.has(column)) {
        // Already a JOBLUX field name (was mapped during parsing)
        mappings[column] = column
      } else {
        const normalizedColumn = column.toLowerCase().replace(/[_.-]/g, ' ').trim()
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
    console.error('XML import error:', error)
    return NextResponse.json(
      { error: 'Failed to process XML file', details: error.message },
      { status: 500 }
    )
  }
}
