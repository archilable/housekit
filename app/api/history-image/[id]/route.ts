import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const h = await prisma.history.findUnique({
    where: { id },
    select: { estimateImageBase64: true, contractImageBase64: true },
  })
  if (!h) return NextResponse.json({}, { status: 404 })
  return NextResponse.json({
    estimateImageBase64: h.estimateImageBase64 || undefined,
    contractImageBase64: h.contractImageBase64 || undefined,
  })
}
