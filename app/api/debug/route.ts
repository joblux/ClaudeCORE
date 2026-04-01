import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY
  return NextResponse.json({
    has_key: !!key,
    key_length: key ? key.length : 0,
    key_prefix: key ? key.substring(0, 10) + '...' : 'NOT SET',
    all_anthropic_vars: Object.keys(process.env).filter(k => k.includes('ANTHROPIC')),
  })
}
