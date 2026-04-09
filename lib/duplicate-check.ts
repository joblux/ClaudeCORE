import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface DuplicateCheckPayload {
  content_type: 'event' | 'signal' | 'article' | 'salary_benchmark'
  title?: string
  source_url?: string
  slug?: string
  headline?: string
  start_date?: string
  city?: string
  organizer?: string
  brand_slug?: string
  job_title?: string
  seniority?: string
}

export interface DuplicateMatch {
  id: string
  title: string
  content_type: string
  status: string
  source: string
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  match: DuplicateMatch | null
}

const NO_MATCH: DuplicateCheckResult = { isDuplicate: false, match: null }

function normalize(str?: string): string {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '')
}

function hit(id: string, title: string, content_type: string, status: string, source: string): DuplicateCheckResult {
  return { isDuplicate: true, match: { id, title: title || '(untitled)', content_type, status, source } }
}

export async function checkDuplicate(
  payload: DuplicateCheckPayload,
  currentQueueId?: string
): Promise<DuplicateCheckResult> {
  switch (payload.content_type) {
    case 'event': return checkEvent(payload, currentQueueId)
    case 'signal': return checkSignal(payload, currentQueueId)
    case 'article': return checkArticle(payload, currentQueueId)
    case 'salary_benchmark': return checkSalary(payload, currentQueueId)
    default: return NO_MATCH
  }
}

async function checkEvent(p: DuplicateCheckPayload, cur?: string): Promise<DuplicateCheckResult> {
  const nTitle = normalize(p.title)
  if (nTitle) {
    const { data } = await supabaseAdmin.from('events').select('id, title, name').limit(200)
    for (const e of data || []) {
      if (normalize(e.title) === nTitle || normalize(e.name) === nTitle)
        return hit(e.id, e.title || e.name, 'event', 'published', 'events')
    }
  }
  if (nTitle) {
    let q = supabaseAdmin.from('content_queue').select('id, title, status')
      .eq('content_type', 'event')
      .not('status', 'in', '("rejected","archived")')
      .limit(200)
    if (cur) q = q.neq('id', cur)
    const { data } = await q
    for (const r of data || []) {
      if (normalize(r.title) === nTitle)
        return hit(r.id, r.title, 'event', r.status, 'content_queue')
    }
  }
  if (p.start_date && p.city) {
    const nCity = normalize(p.city)
    const { data } = await supabaseAdmin.from('events').select('id, title, name, city, location_city')
      .eq('start_date', p.start_date).limit(50)
    for (const e of data || []) {
      if (normalize(e.city) === nCity || normalize(e.location_city) === nCity)
        return hit(e.id, e.title || e.name, 'event', 'published', 'events')
    }
  }
  return NO_MATCH
}

async function checkSignal(p: DuplicateCheckPayload, cur?: string): Promise<DuplicateCheckResult> {
  const nHeadline = normalize(p.headline)
  if (p.source_url) {
    const { data } = await supabaseAdmin.from('signals').select('id, headline')
      .eq('source_url', p.source_url).limit(1)
    if (data?.[0]) return hit(data[0].id, data[0].headline, 'signal', 'published', 'signals')
  }
  if (p.source_url) {
    let q = supabaseAdmin.from('content_queue').select('id, title, status')
      .eq('content_type', 'signal').eq('source_url', p.source_url)
      .not('status', 'in', '("rejected","archived")').limit(1)
    if (cur) q = q.neq('id', cur)
    const { data } = await q
    if (data?.[0]) return hit(data[0].id, data[0].title, 'signal', data[0].status, 'content_queue')
  }
  if (nHeadline) {
    const { data } = await supabaseAdmin.from('signals').select('id, headline').limit(200)
    for (const s of data || []) {
      if (normalize(s.headline) === nHeadline)
        return hit(s.id, s.headline, 'signal', 'published', 'signals')
    }
  }
  if (nHeadline) {
    let q = supabaseAdmin.from('content_queue').select('id, title, status')
      .eq('content_type', 'signal')
      .not('status', 'in', '("rejected","archived")').limit(200)
    if (cur) q = q.neq('id', cur)
    const { data } = await q
    for (const r of data || []) {
      if (normalize(r.title) === nHeadline)
        return hit(r.id, r.title, 'signal', r.status, 'content_queue')
    }
  }
  return NO_MATCH
}

async function checkArticle(p: DuplicateCheckPayload, cur?: string): Promise<DuplicateCheckResult> {
  const nTitle = normalize(p.title)
  if (p.slug) {
    const { data } = await supabaseAdmin.from('bloglux_articles').select('id, title')
      .eq('slug', p.slug).eq('status', 'published').limit(1)
    if (data?.[0]) return hit(data[0].id, data[0].title, 'article', 'published', 'bloglux_articles')
  }
  if (p.slug) {
    let q = supabaseAdmin.from('content_queue').select('id, title, status, processed_content')
      .eq('content_type', 'article')
      .not('status', 'in', '("rejected","archived")').limit(100)
    if (cur) q = q.neq('id', cur)
    const { data } = await q
    for (const r of data || []) {
      const pc = (r.processed_content || {}) as any
      if (pc.slug === p.slug)
        return hit(r.id, r.title, 'article', r.status, 'content_queue')
    }
  }
  if (nTitle) {
    const { data } = await supabaseAdmin.from('bloglux_articles').select('id, title').limit(200)
    for (const a of data || []) {
      if (normalize(a.title) === nTitle)
        return hit(a.id, a.title, 'article', 'published', 'bloglux_articles')
    }
  }
  if (nTitle) {
    let q = supabaseAdmin.from('content_queue').select('id, title, status')
      .eq('content_type', 'article')
      .not('status', 'in', '("rejected","archived")').limit(200)
    if (cur) q = q.neq('id', cur)
    const { data } = await q
    for (const r of data || []) {
      if (normalize(r.title) === nTitle)
        return hit(r.id, r.title, 'article', r.status, 'content_queue')
    }
  }
  return NO_MATCH
}

async function checkSalary(p: DuplicateCheckPayload, cur?: string): Promise<DuplicateCheckResult> {
  const nBrand = normalize(p.brand_slug)
  if (!nBrand) return NO_MATCH
  let q = supabaseAdmin.from('content_queue').select('id, title, status, processed_content')
    .eq('content_type', 'salary_benchmark')
    .not('status', 'in', '("rejected","archived")').limit(100)
  if (cur) q = q.neq('id', cur)
  const { data: queueRows } = await q
  for (const r of queueRows || []) {
    const pc = (r.processed_content || {}) as any
    if (normalize(pc.brand_slug) === nBrand)
      return hit(r.id, r.title || `${pc.brand_slug} salary`, 'salary_benchmark', r.status, 'content_queue')
  }
  if (p.job_title && p.city && p.seniority) {
    const nJob = normalize(p.job_title)
    const nCity = normalize(p.city)
    const nSeniority = normalize(p.seniority)
    const { data } = await supabaseAdmin.from('salary_benchmarks')
      .select('id, brand_slug, job_title, city, seniority').limit(500)
    for (const r of data || []) {
      if (
        normalize(r.brand_slug) === nBrand &&
        normalize(r.job_title) === nJob &&
        normalize(r.city) === nCity &&
        normalize(r.seniority) === nSeniority
      )
        return hit(r.id, `${r.brand_slug} — ${r.job_title} (${r.city})`, 'salary_benchmark', 'published', 'salary_benchmarks')
    }
  }
  return NO_MATCH
}
