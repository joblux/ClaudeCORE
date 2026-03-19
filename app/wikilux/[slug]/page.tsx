import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BRANDS } from '@/lib/wikilux-brands'

interface Props {
  params: { slug: string }
}

export function generateMetadata({ params }: Props): Metadata {
  const brand = BRANDS.find((b) => b.slug === params.slug)
  if (!brand) return { title: 'Brand Not Found — WikiLux' }
  return {
    title: `${brand.name} — WikiLux by JOBLUX`,
    description: brand.description,
  }
}

export default function BrandPage({ params }: Props) {
  const brand = BRANDS.find((b) => b.slug === params.slug)
  if (!brand) notFound()

  const knownForTags = brand.known_for.split(',').map((t) => t.trim())

  // 3 random brands from same sector (excluding current)
  const sameSector = BRANDS.filter((b) => b.sector === brand.sector && b.slug !== brand.slug)
  const related = sameSector.sort(() => 0.5 - Math.random()).slice(0, 3)

  return (
    <div>
      {/* HERO */}
      <div className="bg-[#222222] py-14">
        <div className="jl-container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/wikilux" className="jl-overline text-[#888] hover:text-[#a58e28] transition-colors">WikiLux</Link>
            <span className="text-[#555] text-xs">/</span>
            <span className="jl-overline text-[#a58e28]">{brand.name}</span>
          </div>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="jl-badge text-[0.55rem]">{brand.sector}</span>
            <span className="jl-badge-outline text-[0.55rem] border-[#444] text-[#999]">{brand.group}</span>
          </div>

          <h1 className="jl-serif text-4xl md:text-5xl font-light text-white mb-3">
            {brand.name}
          </h1>
          <p className="font-sans text-sm text-[#888]">
            Est. {brand.founded} &middot; {brand.country} &middot; {brand.headquarters}
          </p>
        </div>
      </div>

      <div className="jl-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT — About */}
          <div className="lg:col-span-2">
            <div className="jl-section-label"><span>About</span></div>
            <div className="jl-prose mb-10">
              <p>{brand.description}</p>
            </div>

            {/* Hiring Profile */}
            <div className="jl-section-label"><span>Hiring Profile</span></div>
            <blockquote className="border-l-2 border-[#a58e28] pl-5 py-2 mb-10 bg-[#fafaf5]">
              <p className="jl-editorial">{brand.hiring_profile}</p>
            </blockquote>
          </div>

          {/* RIGHT — Sidebar */}
          <div>
            <div className="border border-[#e8e2d8] p-5">
              <div className="space-y-4">
                {([
                  ['Founded', String(brand.founded)],
                  ['Headquarters', brand.headquarters],
                  ['Country', brand.country],
                  ['Sector', brand.sector],
                  ['Group', brand.group],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-[#f0ece4] pb-3 last:border-0 last:pb-0">
                    <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider">{label}</span>
                    <span className="font-sans text-sm font-medium text-[#1a1a1a]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Known For */}
              <div className="mt-5 pt-4 border-t border-[#f0ece4]">
                <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-3">Known For</span>
                <div className="flex flex-wrap gap-2">
                  {knownForTags.map((tag) => (
                    <span key={tag} className="font-sans text-[0.6rem] text-[#a58e28] border border-[#e8e2d8] px-2.5 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RELATED BRANDS */}
        {related.length > 0 && (
          <div className="mt-10 pt-10 border-t border-[#e8e2d8]">
            <div className="jl-section-label"><span>Explore More in {brand.sector}</span></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/wikilux/${r.slug}`}
                  className="jl-card flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#a58e28] transition-colors">
                    <span className="jl-serif text-base text-[#a58e28] group-hover:text-[#1a1a1a]">
                      {r.name[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-sans text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
                      {r.name}
                    </div>
                    <div className="font-sans text-[0.65rem] text-[#aaa] mt-0.5">
                      {r.sector} &middot; {r.country} &middot; Est. {r.founded}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
