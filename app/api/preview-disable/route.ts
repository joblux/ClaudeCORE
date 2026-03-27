import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const response = NextResponse.redirect(new URL('/holding', url.origin))
  response.cookies.set('joblux_preview', '', {
    path: '/',
    maxAge: 0,
  })
  return response
}
