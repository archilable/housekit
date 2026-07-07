import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return new NextResponse('unauthorized', { status: 401 })

  const url = req.nextUrl.searchParams.get('url')
  const name = req.nextUrl.searchParams.get('name') ?? 'download'
  if (!url) return new NextResponse('missing url', { status: 400 })

  const res = await fetch(url)
  if (!res.ok) return new NextResponse('fetch failed', { status: 502 })

  const contentType = res.headers.get('content-type') ?? 'application/octet-stream'
  const blob = await res.arrayBuffer()

  return new NextResponse(blob, {
    headers: {
      'content-type': contentType,
      'content-disposition': `attachment; filename="${encodeURIComponent(name)}"`,
    },
  })
}
