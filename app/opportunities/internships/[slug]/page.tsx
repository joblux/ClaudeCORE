import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
import type { InternshipListing } from '@/types/internship'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function textToLines(text: string | null): string[] {
  if (!text) return []
  return text.split('\n').map(l => l.trim()).filter(Boolean)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function remotePolicyLabel(val: string): string {
  const map: Record<string, string> = { on_site: 'On-site', hybrid: 'Hybrid', remote: 'Remote' }
  return map[val] || val
}

/* ------------------------------------------------------------------ */
/*  Metadata generation                                                */
/* ------------------------------------------------------------------ */
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  // uses module-level supabase client
  const { data } = await supabase
    .from('internship_listings')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'approved')
    .single()

  if (!data) return { title: 'Internship Not Found | JOBLUX' }

  const internship = data as InternshipListing
  const title = internship.seo_title || `${internship.title} Internship at ${internship.company_name} | JOBLUX`
  const description = internship.seo_description || (internship.description || '').slice(0, 160)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'JOBLUX',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

/* ------------------------------------------------------------------ */
/*  JSON-LD structured data                                            */
/* ------------------------------------------------------------------ */
function buildJsonLd(internship: InternshipListing) {
  const ld: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: internship.title,
    description: internship.description || '',
    datePosted: internship.approved_at || internship.created_at,
    employmentType: 'INTERN',
    hiringOrganization: {
      '@type': 'Organization',
      name: internship.company_name,
    },
  }

  if (internship.company_website) {
    ld.hiringOrganization.sameAs = internship.company_website
  }

  if (internship.city || internship.country) {
    ld.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: internship.city || undefined,
        addressCountry: internship.country || undefined,
      },
    }
  }

  if (internship.remote_policy === 'remote') {
    ld.jobLocationType = 'TELECOMMUTE'
  }

  if (internship.expires_at) {
    ld.validThrough = internship.expires_at
  }

  return ld
}

/* ================================================================== */
/*  Page component (Server Component)                                  */
/* ================================================================== */
export default async function InternshipDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  // uses module-level supabase client
  const { data } = await supabase
    .from('internship_listings')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'approved')
    .single()

  if (!data) notFound()

  const internship = data as InternshipListing
  const jsonLd = buildJsonLd(internship)
  const responsibilityLines = textToLines(internship.responsibilities)
  const requirementLines = textToLines(internship.requirements)
  const niceToHaveLines = textToLines(internship.nice_to_haves)

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        {/* Header section */}
        <div className="border-b-2 border-[#1a1a1a] py-10">
          <div className="jl-container">
            <a href="/opportunities" className="jl-overline text-[#a58e28] hover:underline mb-4 inline-block">
              &larr; All Opportunities
            </a>

            {/* Internship badge */}
            <div className="mb-3">
              <span className="jl-badge-gold text-[0.6rem] px-3 py-1">INTERNSHIP</span>
            </div>

            {/* Company name */}
            <p className="jl-serif text-lg text-[#a58e28] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {internship.company_name}
            </p>

            {/* Title */}
            <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
              {internship.title}
            </h1>

            {/* Location */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="font-sans text-sm text-[#888]">
                {[internship.city, internship.country].filter(Boolean).join(', ')}
              </span>
              {internship.department && (
                <span className="jl-badge-outline text-[0.55rem]">{internship.department}</span>
              )}
              <span className="jl-badge-outline text-[0.55rem]">
                {remotePolicyLabel(internship.remote_policy)}
              </span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="jl-container py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left column -- description sections */}
            <div className="lg:col-span-2">

              {/* Description */}
              {internship.description && (
                <>
                  <div className="jl-section-label"><span>About the Role</span></div>
                  <div className="font-sans text-sm text-[#333] leading-relaxed mb-10 whitespace-pre-line jl-prose">
                    {internship.description}
                  </div>
                </>
              )}

              {/* Responsibilities */}
              {responsibilityLines.length > 0 && (
                <>
                  <div className="jl-section-label"><span>Responsibilities</span></div>
                  <ul className="space-y-3 mb-10">
                    {responsibilityLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>
                        <span className="font-sans text-sm text-[#555] leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Requirements */}
              {requirementLines.length > 0 && (
                <>
                  <div className="jl-section-label"><span>Requirements</span></div>
                  <ul className="space-y-3 mb-10">
                    {requirementLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>
                        <span className="font-sans text-sm text-[#555] leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Nice to Haves */}
              {niceToHaveLines.length > 0 && (
                <>
                  <div className="jl-section-label"><span>Nice to Have</span></div>
                  <ul className="space-y-3 mb-10">
                    {niceToHaveLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>
                        <span className="font-sans text-sm text-[#555] leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Right sidebar */}
            <div>
              <div className="jl-card border border-[#e8e2d8] p-5 mb-6">
                <div className="space-y-4">
                  {/* Duration */}
                  <div className="flex justify-between border-b border-[#f0ece4] pb-3">
                    <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider">Duration</span>
                    <span className="font-sans text-sm text-[#1a1a1a]">{internship.duration}</span>
                  </div>

                  {/* Start Date */}
                  {internship.start_date && (
                    <div className="flex justify-between border-b border-[#f0ece4] pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider">Start Date</span>
                      <span className="font-sans text-sm text-[#1a1a1a]">{internship.start_date}</span>
                    </div>
                  )}

                  {/* Paid / Unpaid */}
                  <div className="flex justify-between border-b border-[#f0ece4] pb-3">
                    <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider">Compensation</span>
                    <span className="font-sans text-sm text-[#1a1a1a]">
                      {internship.is_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  {/* Compensation Details */}
                  {internship.is_paid && internship.compensation_details && (
                    <div className="border-b border-[#f0ece4] pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-1">Details</span>
                      <span className="font-sans text-sm text-[#1a1a1a]">{internship.compensation_details}</span>
                    </div>
                  )}

                  {/* Remote Policy */}
                  <div className="flex justify-between border-b border-[#f0ece4] pb-3">
                    <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider">Work Model</span>
                    <span className="font-sans text-sm text-[#1a1a1a]">{remotePolicyLabel(internship.remote_policy)}</span>
                  </div>

                  {/* Languages */}
                  {internship.languages_required && internship.languages_required.length > 0 && (
                    <div className="border-b border-[#f0ece4] pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-2">Languages</span>
                      <div className="flex flex-wrap gap-1.5">
                        {internship.languages_required.map(l => (
                          <span key={l} className="jl-badge-outline text-[0.55rem]">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Luxury Sector */}
                  {internship.luxury_sector && (
                    <div className="flex justify-between border-b border-[#f0ece4] pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider">Sector</span>
                      <span className="font-sans text-sm text-[#1a1a1a]">{internship.luxury_sector}</span>
                    </div>
                  )}

                  {/* Product Categories */}
                  {internship.product_categories && internship.product_categories.length > 0 && (
                    <div className="pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-2">Product Categories</span>
                      <div className="flex flex-wrap gap-1.5">
                        {internship.product_categories.map(pc => (
                          <span key={pc} className="jl-badge-outline text-[0.55rem]">{pc}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Company website link */}
              {internship.company_website && (
                <a
                  href={internship.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-sm text-[#a58e28] hover:underline mb-4"
                >
                  Visit {internship.company_name} &rarr;
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
