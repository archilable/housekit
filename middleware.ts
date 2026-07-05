import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

let lastPing = 0

export function middleware(req: NextRequest) {
  const now = Date.now()
  // DB keepalive: 4분마다 백그라운드 ping (슬립 방지)
  if (now - lastPing > 60 * 1000) {
    lastPing = now
    const url = req.nextUrl.clone()
    url.pathname = '/api/keepalive'
    fetch(url.toString()).catch(() => {})
  }
  return NextResponse.next()
}

export const config = { matcher: ['/houses', '/houses/:path*', '/notifications'] }
