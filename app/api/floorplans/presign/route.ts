import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { issueSignedToken, presignUrl } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { pathname, contentType } = await req.json()
  if (!pathname) return NextResponse.json({ error: 'pathname required' }, { status: 400 })

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
  const types = contentType && allowed.includes(contentType) ? [contentType] : allowed

  const signedToken = await issueSignedToken({
    operations: ['put'],
    pathname,
    maximumSizeInBytes: 20 * 1024 * 1024,
    allowedContentTypes: types,
  })

  const { presignedUrl: url } = await presignUrl(signedToken, {
    operation: 'put',
    access: 'public',
    pathname,
  })

  return NextResponse.json({ presignedUrl: url })
}
