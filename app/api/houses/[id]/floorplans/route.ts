import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const floorPlans = await prisma.floorPlan.findMany({
    where: { houseId: id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(floorPlans)
}
