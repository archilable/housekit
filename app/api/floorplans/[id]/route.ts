import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const fp = await prisma.floorPlan.findUnique({ where: { id } })
  if (!fp) return NextResponse.json({ error: 'not found' }, { status: 404 })

  await del(fp.url)
  await prisma.floorPlan.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
