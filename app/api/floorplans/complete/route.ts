import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { houseId, name, url, fileType, fileSize } = await req.json()
  if (!houseId || !name || !url) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  const fp = await prisma.floorPlan.create({
    data: { houseId, name, url, fileType: fileType ?? 'image', fileSize: fileSize ?? 0 },
  })

  return NextResponse.json(fp)
}
