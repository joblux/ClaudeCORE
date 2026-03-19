'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const popularSearches = [
  { label: 'Store Director Paris',    q: 'Store Director Paris'    },
  { label: 'Chanel WikiLux',          q: 'Chanel'                  },
  { label: 'Buyer Salary Dubai',      q: 'buyer salary dubai'      },
  { label: 'Hermès Interview Prep',   q: 'Hermès interview'        },
  { label: 'LVMH Careers',            q: 'LVMH'                    },
  { label: 'Regional Director Asia',  q: 'Regional Director Asia'  },
]

export function SearchHero() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handlePopular = (q: string) => {
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="border-b-2 border-[#1a1a1a] py-12 md:py-16">
      <div className="jl-container-sm text-center">

        {/* Label */}
        <div className="jl-overline mb-6">
          Search jobs · brands · salaries · interview guides · travel
        </div>

        {/* Search box */}
        <form onSubmit={handleSearch} className="mx-auto mb-5">
          <div className="jl-search mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chanel Store Director, luxury buyer salary, Hermès interview..."
              aria-label="Search JOBLUX"
            />
            <button type="submit">Search</button>
          </div>
        </form>

        {/* Popular searches */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="jl-overline">Popular:</span>
          {popularSearches.map((s) => (
            <button
              key={s.label}
              onClick={() => handlePopular(s.q)}
              className="font-sans text-[0.7rem] text-[#777] border border-[#e8e2d8] px-3 py-1.5 hover:border-[#a58e28] hover:text-[#a58e28] transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
