'use client'

import { CURRENCY_SYMBOLS } from '@/lib/assignment-options'

interface SalaryRangeBarProps {
  min: number
  max: number
  median?: number | null
  percentile25?: number | null
  percentile75?: number | null
  userSalary?: number | null
  currency?: string
  showLabels?: boolean
  height?: number
}

function formatSalary(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  if (amount >= 1000) {
    return `${symbol}${Math.round(amount / 1000)}k`
  }
  return `${symbol}${amount.toLocaleString()}`
}

export function formatSalaryFull(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  return `${symbol}${amount.toLocaleString()}`
}

export default function SalaryRangeBar({
  min,
  max,
  median,
  percentile25,
  percentile75,
  userSalary,
  currency = 'EUR',
  showLabels = true,
  height = 8,
}: SalaryRangeBarProps) {
  const range = max - min || 1
  const getPos = (val: number) => Math.max(0, Math.min(100, ((val - min) / range) * 100))

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[0.6rem] text-[#999]">{formatSalary(min, currency)}</span>
          {median && (
            <span className="text-[0.6rem] text-[#a58e28] font-medium">{formatSalary(median, currency)}</span>
          )}
          <span className="text-[0.6rem] text-[#999]">{formatSalary(max, currency)}</span>
        </div>
      )}
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: '#e8e2d8' }}
      >
        {/* Main range bar */}
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: '0%',
            width: '100%',
            backgroundColor: '#a58e28',
            opacity: 0.25,
          }}
        />
        {/* IQR range (25th-75th) */}
        {percentile25 != null && percentile75 != null && (
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${getPos(percentile25)}%`,
              width: `${getPos(percentile75) - getPos(percentile25)}%`,
              backgroundColor: '#a58e28',
              opacity: 0.5,
            }}
          />
        )}
        {/* Median marker */}
        {median && (
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${getPos(median)}%`,
              width: 3,
              backgroundColor: '#a58e28',
              transform: 'translateX(-1px)',
            }}
          />
        )}
        {/* User salary marker */}
        {userSalary != null && (
          <div
            className="absolute h-full"
            style={{
              left: `${getPos(userSalary)}%`,
              width: 3,
              backgroundColor: '#1a1a1a',
              top: -2,
              height: height + 4,
              transform: 'translateX(-1px)',
              borderRadius: 2,
            }}
          />
        )}
      </div>
      {userSalary != null && showLabels && (
        <div className="mt-1 text-center">
          <span className="text-[0.6rem] text-[#1a1a1a] font-medium">
            Your salary: {formatSalaryFull(userSalary, currency)}
          </span>
        </div>
      )}
    </div>
  )
}
