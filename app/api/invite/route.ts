import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { houseId } = await req.json()

  // 본인 집인지 확인
  const house = await prisma.house.findFirst({ where: { id: houseId, userId: session.user.id } })
  if (!house) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const invite = await prisma.houseInvite.create({ data: { houseId } })
  return NextResponse.json({ token: invite.token })
}
