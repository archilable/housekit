import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { pathname, contentType } = await req.json()
  if (!pathname) return NextResponse.json({ error: 'pathname required' }, { status: 400 })

  const types = contentType && ALLOWED.includes(contentType) ? [contentType] : ALLOWED

  const clientToken = await generateClientTokenFromReadWriteToken({
    pathname,
    maximumSizeInBytes: 20 * 1024 * 1024,
    allowedContentTypes: types,
    validUntil: Date.now() + 60 * 60 * 1000,
  })

  // storeId: BLOB_READ_WRITE_TOKEN = vercel_blob_rw_${storeId}_...
  const raw = process.env.BLOB_READ_WRITE_TOKEN ?? ''
  const storeId = raw.split('_')[3] ?? ''

  return NextResponse.json({ clientToken, storeId })
}
