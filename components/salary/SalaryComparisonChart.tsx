'use client'

import { CURRENCY_SYMBOLS } from '@/lib/assignment-options'

interface ComparisonItem {
  label: string
  min: number
  max: number
  median: number
  currency: string
  costIndex?: number | null
}

interface SalaryComparisonChartProps {
  items: ComparisonItem[]
  showCostIndex?: boolean
}

function formatK(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  if (amount >= 1000) return `${symbol}${Math.round(amount / 1000)}k`
  return `${symbol}${amount.toLocaleString()}`
}

export default function SalaryComparisonChart({
  items,
  showCostIndex = false,
}: SalaryComparisonChartProps) {
  if (items.length === 0) return null

  // Find global min/max for scale
  const globalMin = Math.min(...items.map(i => i.min))
  const globalMax = Math.max(...items.map(i => i.max))
  const range = globalMax - globalMin || 1

  // Sort by median DESC
  const sorted = [...items].sort((a, b) => b.median - a.median)
  const highestMedian = sorted[0]?.median || 0

  const getPos = (val: number) => Math.max(0, Math.min(100, ((val - globalMin) / range) * 100))

  return (
    <div className="space-y-3">
      {sorted.map((item, i) => {
        const isTop = item.median === highestMedian
        return (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-24 flex-shrink-0 text-right">
              <span className={`text-xs font-medium ${isTop ? 'text-[#a58e28]' : 'text-[#555]'}`}>
                {item.label}
              </span>
              {showCostIndex && item.costIndex != null && (
                <div className="text-[0.55rem] text-[#ccc]">COL: {item.costIndex}</div>
              )}
            </div>
            <div className="flex-1 relative h-6 bg-[#f5f3ee] rounded-sm overflow-hidden">
              <div
                className="absolute top-0 h-full rounded-sm"
                style={{
                  left: `${getPos(item.min)}%`,
                  width: `${Math.max(2, getPos(item.max) - getPos(item.min))}%`,
                  backgroundColor: isTop ? '#a58e28' : '#d4cbb8',
                }}
              />
              {/* Median dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white"
                style={{
                  left: `${getPos(item.median)}%`,
                  backgroundColor: isTop ? '#1a1a1a' : '#888',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
            <div className="w-20 flex-shrink-0">
              <span className={`text-xs ${isTop ? 'text-[#a58e28] font-medium' : 'text-[#888]'}`}>
                {formatK(item.median, item.currency)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
