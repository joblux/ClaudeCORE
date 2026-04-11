'use client'

// Reusable controlled pagination control.
//
// Stateless: parent owns `page`, this component renders Prev / page numbers
// (with ellipses for >7 pages) / Next and calls `onPageChange`.
//
// Two themes:
//   - 'dark'  → public pages on #1a1a1a (signals, events, insights, careers)
//   - 'light' → /admin/content-queue
//
// Returns null when there is only one page (no UI when nothing to paginate).

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (p: number) => void
  theme?: 'dark' | 'light'
  className?: string
}

export default function Pagination({
  page,
  pageCount,
  onPageChange,
  theme = 'dark',
  className = '',
}: PaginationProps) {
  if (pageCount <= 1) return null

  const isDark = theme === 'dark'
  const baseBtn =
    'min-w-[32px] h-8 px-2.5 text-[12px] rounded transition-colors flex items-center justify-center'
  const themeBtn = isDark
    ? 'border border-[#2a2a2a] text-[#999] hover:border-[#555] hover:text-white'
    : 'border border-[#e8e8e8] text-[#666] hover:border-[#bbb] hover:text-[#111]'
  const themeActive = isDark
    ? 'bg-[#a58e28] text-white border border-[#a58e28]'
    : 'bg-[#111] text-white border border-[#111]'
  const disabled = 'opacity-30 pointer-events-none'

  // Compute visible page numbers with ellipses
  const numbers: (number | 'ellipsis')[] = []
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) numbers.push(i)
  } else {
    numbers.push(1)
    if (page > 4) numbers.push('ellipsis')
    const start = Math.max(2, page - 1)
    const end = Math.min(pageCount - 1, page + 1)
    for (let i = start; i <= end; i++) numbers.push(i)
    if (page < pageCount - 3) numbers.push('ellipsis')
    numbers.push(pageCount)
  }

  const go = (p: number) => {
    const next = Math.max(1, Math.min(pageCount, p))
    if (next !== page) onPageChange(next)
  }

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1.5 mt-6 flex-wrap ${className}`}
    >
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={`${baseBtn} ${themeBtn} ${page <= 1 ? disabled : ''}`}
      >
        ← Prev
      </button>
      {numbers.map((n, i) =>
        n === 'ellipsis' ? (
          <span
            key={`e${i}`}
            className={`${baseBtn} pointer-events-none ${isDark ? 'text-[#555]' : 'text-[#999]'}`}
          >
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => go(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`${baseBtn} ${n === page ? themeActive : themeBtn}`}
          >
            {n}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className={`${baseBtn} ${themeBtn} ${page >= pageCount ? disabled : ''}`}
      >
        Next →
      </button>
    </nav>
  )
}
