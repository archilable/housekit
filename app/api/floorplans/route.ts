import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'
function createId() { return randomBytes(12).toString('base64url') }

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const houseId = formData.get('houseId') as string | null
  const name = formData.get('name') as string | null

  if (!file || !houseId || !name) return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: '파일 크기는 20MB 이하여야 합니다' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const isPdf = ext === 'pdf'
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)
  if (!isPdf && !isImage) return NextResponse.json({ error: '지원하지 않는 파일 형식입니다' }, { status: 400 })

  const id = createId()
  const pathname = `floorplans/${houseId}/${id}.${ext}`

  const blob = await put(pathname, file, { access: 'public', contentType: file.type })

  const floorPlan = await prisma.floorPlan.create({
    data: { id, houseId, name, url: blob.url, fileType: isPdf ? 'pdf' : 'image', fileSize: file.size },
  })

  return NextResponse.json(floorPlan)
}
