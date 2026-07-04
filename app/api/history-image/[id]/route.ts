import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const images = await prisma.historyImage.findMany({
    where: { historyId: id },
    orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    select: { type: true, imageBase64: true, sortOrder: true },
  })
  return NextResponse.json({ images })
}
