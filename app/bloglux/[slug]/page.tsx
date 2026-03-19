import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Props {
  params: { slug: string }
}

async function getArticle(slug: string) {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data
}

async function getMoreArticles(excludeSlug: string) {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, excerpt, category, author_name, published_at, read_time')
    .eq('published', true)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(3)
  return data || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug)
  if (!article) return { title: 'Article Not Found — Bloglux' }
  return {
    title: `${article.title} — Bloglux by JOBLUX`,
    description: article.excerpt || article.title,
  }
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug)
  if (!article) notFound()

  const moreArticles = await getMoreArticles(params.slug)

  // Split content into paragraphs
  const paragraphs = article.content.split('\n\n').filter((p: string) => p.trim())

  return (
    <div>
      {/* HERO */}
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <Link href="/bloglux" className="jl-overline text-[#a58e28] hover:underline mb-4 inline-block">&larr; Bloglux</Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="jl-badge text-[0.55rem]">{article.category}</span>
            {article.read_time && (
              <span className="font-sans text-[0.6rem] text-[#aaa]">{article.read_time} min read</span>
            )}
          </div>
          <h1 className="jl-serif text-3xl md:text-[2.75rem] font-light text-[#1a1a1a] mb-4 leading-tight max-w-3xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="jl-editorial max-w-2xl mb-4">{article.excerpt}</p>
          )}
          <div className="font-sans text-[0.65rem] text-[#aaa] tracking-wide">
            {article.author_name} &middot; {formatDate(article.published_at)}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="jl-container py-10">
        <div className="max-w-2xl">
          <div className="jl-prose">
            {paragraphs.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[#e8e2d8]">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <span key={tag} className="font-sans text-[0.6rem] text-[#a58e28] border border-[#e8e2d8] px-2.5 py-1 tracking-wider uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MORE FROM BLOGLUX */}
      {moreArticles.length > 0 && (
        <div className="border-t border-[#e8e2d8]">
          <div className="jl-container py-10">
            <div className="jl-section-label"><span>More from Bloglux</span></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {moreArticles.map((a) => (
                <Link key={a.id} href={`/bloglux/${a.slug}`} className="jl-card group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="jl-overline-gold">{a.category}</span>
                    {a.read_time && <span className="font-sans text-[0.6rem] text-[#bbb]">{a.read_time} min</span>}
                  </div>
                  <h3 className="jl-serif text-base font-light text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors mb-2 leading-snug">
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p className="font-sans text-xs text-[#888] leading-relaxed line-clamp-2">{a.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
