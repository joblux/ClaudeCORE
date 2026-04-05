import { NextResponse } from 'next/server'
import { getBrandStats } from '@/lib/brand-stats'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await getBrandStats()
    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Brand stats error:', error)
    return NextResponse.json({ total: 0, published: 0, empty: 0, languages: 9 }, { status: 500 })
  }
}
