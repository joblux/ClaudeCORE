'use client'

import Link from 'next/link'
import { ACCESS_RANK, SALARY_ACCESS } from '@/types/salary'

interface AccessTierLadderProps {
  currentLevel: string
}

const tiers = [
  { key: 'browse', label: 'Browse', points: 0, desc: 'Explore salary ranges by role, brand, and city' },
  { key: 'benchmark', label: 'Benchmark', points: 10, desc: 'See how your salary compares' },
  { key: 'compare', label: 'Compare', points: 25, desc: 'Compare salaries across cities and brands' },
  { key: 'calculator', label: 'Calculator', points: 50, desc: 'Get a personalised salary estimate' },
]

export default function AccessTierLadder({ currentLevel }: AccessTierLadderProps) {
  const currentRank = ACCESS_RANK[currentLevel] ?? 0

  return (
    <div className="space-y-2">
      {tiers.map((tier, i) => {
        const tierRank = i // 0=basic, 1=standard, 2=premium, 3=full
        const isUnlocked = currentRank >= tierRank
        const isCurrent = currentRank === tierRank
        const isNext = currentRank === tierRank - 1

        return (
          <div
            key={tier.key}
            className={`flex items-start gap-3 p-3 rounded-sm border transition-colors ${
              isUnlocked
                ? 'border-[#a58e28] bg-[#fafaf5]'
                : isCurrent || isNext
                ? 'border-[#e8e2d8] bg-white'
                : 'border-[#f0ece4] bg-[#fafaf5] opacity-60'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isUnlocked ? (
                <div className="w-5 h-5 rounded-full bg-[#a58e28] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-[#e8e2d8] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isUnlocked ? 'text-[#a58e28]' : 'text-[#888]'}`}>
                  {tier.label}
                </span>
                {tier.points > 0 && !isUnlocked && (
                  <span className="text-[0.55rem] text-[#ccc]">{tier.points} pts</span>
                )}
                {isCurrent && (
                  <span className="text-[0.55rem] text-[#a58e28] font-medium">Current</span>
                )}
              </div>
              <p className="text-[0.65rem] text-[#999] leading-relaxed">{tier.desc}</p>
            </div>
          </div>
        )
      })}
      <Link href="/contribute" className="block text-center text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors mt-3">
        Contribute to earn points &rarr;
      </Link>
    </div>
  )
}
