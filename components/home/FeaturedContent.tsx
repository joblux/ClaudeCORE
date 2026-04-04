import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase-server'

interface Article {
  title: string
  slug: string
  category: string
  excerpt: string | null
  published_at: string | null
  read_time_minutes: number | null
  cover_image_url: string | null
}

interface InterviewRow {
  id: string
  job_title: string
  brand_name: string
  location: string | null
  tips: string | null
  overall_experience: string | null
}

function formatDate(d: string | null): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function getHomepageFeature(): Promise<Article | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('bloglux_articles')
    .select('title, slug, category, excerpt, published_at, read_time_minutes, cover_image_url')
    .eq('status', 'published')
    .eq('homepage_feature', true)
    .limit(1)
    .single()

  return data || null
}

async function getArticles(): Promise<Article[]> {
  const supabase = createServerSupabaseClient()
  const { data: featured } = await supabase
    .from('bloglux_articles')
    .select('title, slug, category, excerpt, published_at, read_time_minutes, cover_image_url')
    .eq('status', 'published')
    .eq('featured_homepage', true)
    .order('published_at', { ascending: false })
    .limit(8)

  if (featured && featured.length >= 6) return featured

  const { data: recent } = await supabase
    .from('bloglux_articles')
    .select('title, slug, category, excerpt, published_at, read_time_minutes, cover_image_url')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(8)

  return recent || []
}

// ── Featured Article (lead story with image) ──
export async function FeaturedArticle() {
  const homepageFeatured = await getHomepageFeature()
  const articles = await getArticles()
  const lead = homepageFeatured || articles[0]

  if (!lead) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-[#888]">No articles published yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* Image */}
      {lead.cover_image_url ? (
        <div className="relative bg-[#fafaf5] border border-[#e8e2d8] h-[280px] md:h-[320px] overflow-hidden">
          <Image src={lead.cover_image_url} alt={lead.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
      ) : (
        <div className="bg-[#fafaf5] border border-[#e8e2d8] flex items-center justify-center h-[280px] md:h-[320px]">
          <div className="jl-serif text-2xl font-light tracking-[0.2em] text-[#a58e28] uppercase">{lead.category}</div>
        </div>
      )}
      {/* Text */}
      <div className="flex flex-col justify-center">
        <div className="jl-overline-gold mb-2">{lead.category}</div>
        <h2 className="jl-serif text-2xl font-light text-[#1a1a1a] leading-snug mb-2 hover:text-[#a58e28] transition-colors">
          <Link href={`/insights/${lead.slug}`}>{lead.title}</Link>
        </h2>
        {lead.excerpt && (
          <p className="font-sans text-sm text-[#666] leading-relaxed mb-2">
            {lead.excerpt}
          </p>
        )}
        <div className="jl-overline">
          {formatDate(lead.published_at)}
          {lead.read_time_minutes && <> &nbsp;·&nbsp; {lead.read_time_minutes} min read</>}
        </div>
      </div>
    </div>
  )
}

// ── Article List (numbered, 4 items) ──
export async function ArticleList() {
  const articles = await getArticles()
  const others = articles.slice(1, 5)

  if (others.length === 0) return null

  return (
    <div>
      <div className="jl-section-label"><span>Intelligence</span></div>
      <div className="space-y-0">
        {others.map((article, i) => (
          <div key={article.slug} className="flex items-start gap-4 py-3 border-b border-[#f0ece4] last:border-0">
            <div className="flex-1">
              <div className="jl-overline-gold mb-1">{article.category}</div>
              <h3 className="jl-serif text-base font-light text-[#1a1a1a] leading-snug mb-1 hover:text-[#a58e28] transition-colors">
                <Link href={`/insights/${article.slug}`}>{article.title}</Link>
              </h3>
              <div className="jl-overline">
                {formatDate(article.published_at)}
                {article.read_time_minutes && <> &nbsp;·&nbsp; {article.read_time_minutes} min read</>}
              </div>
            </div>
            <div className="jl-serif text-3xl font-light text-[#e8e2d8] leading-none flex-shrink-0">
              {String(i + 1).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>
      <Link href="/insights" className="inline-block mt-3 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors">
        More intelligence →
      </Link>
    </div>
  )
}

// ── Interview Intelligence ──
export async function InterviewIntelligence() {
  const supabase = createServerSupabaseClient()
  const { data: intData } = await supabase
    .from('interview_experiences')
    .select('id, job_title, brand_name, location, tips, overall_experience')
    .order('created_at', { ascending: false })
    .limit(3)

  const interviews: InterviewRow[] = (intData || []).map((e: any) => ({
    id: e.id,
    job_title: e.job_title,
    brand_name: e.brand_name || '',
    location: e.location,
    tips: e.tips,
    overall_experience: e.overall_experience,
  }))

  return (
    <div>
      <div className="jl-section-label"><span>Interview Intelligence</span></div>
      {interviews.length > 0 ? (
        <div className="space-y-3">
          {interviews.map((exp) => {
            let firstTip: string | null = null
            if (exp.tips) {
              try {
                const parsed = JSON.parse(exp.tips)
                if (Array.isArray(parsed) && parsed.length > 0) firstTip = String(parsed[0]).trim()
                else firstTip = exp.tips.split('\n').map(l => l.trim()).filter(Boolean)[0] || null
              } catch {
                firstTip = exp.tips.split('\n').map(l => l.trim()).filter(Boolean)[0] || null
              }
            }
            const initials = (exp.brand_name || '??').slice(0, 2).toUpperCase()

            return (
              <Link key={exp.id} href="/interviews" className="block group">
                <div className="flex items-start gap-4 p-4 border border-[#e8e2d8] hover:border-[#a58e28] transition-colors">
                  <div className="w-12 h-12 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <span className="jl-serif text-base text-[#a58e28]">{initials}</span>
                  </div>
                  <div className="flex-1">
                    <div className="jl-overline-gold mb-0.5">{exp.brand_name || 'Luxury Maison'}</div>
                    <div className="font-sans text-sm font-medium text-[#1a1a1a] mb-0.5">{exp.job_title}</div>
                    {firstTip && (
                      <p className="jl-serif text-xs text-[#555] leading-relaxed italic">
                        &ldquo;{firstTip}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="font-sans text-sm text-[#888] py-4">
          Confidential interview experiences contributed by luxury professionals.
        </p>
      )}
      <Link href="/interviews" className="inline-block mt-3 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors">
        More interviews →
      </Link>
    </div>
  )
}

// ── Legacy combined export (for any other page that still imports FeaturedContent) ──
export async function FeaturedContent() {
  return (
    <div className="space-y-10">
      <FeaturedArticle />
      <ArticleList />
      <InterviewIntelligence />
    </div>
  )
}
