import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const updated = await prisma.doctorHistory.update({
    where: { id },
    data: { resolved: true, resolvedAt: new Date() },
  })
  return NextResponse.json({ ok: true, resolvedAt: updated.resolvedAt })
}
