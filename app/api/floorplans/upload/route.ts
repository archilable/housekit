import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await req.json()) as HandleUploadBody

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
          maximumSizeInBytes: 20 * 1024 * 1024,
          tokenPayload: clientPayload ?? '',
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { houseId, name } = JSON.parse(tokenPayload ?? '{}')
        if (!houseId || !name) return

        const ext = blob.pathname.split('.').pop()?.toLowerCase() ?? ''
        const fileType = ext === 'pdf' ? 'pdf' : 'image'

        await prisma.floorPlan.create({
          data: {
            houseId,
            name,
            url: blob.url,
            fileType,
            fileSize: 0,
          },
        })
      },
    })
    return NextResponse.json(json)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 })
  }
}
