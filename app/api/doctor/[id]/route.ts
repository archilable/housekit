import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const record = await prisma.doctorHistory.findUnique({
    where: { id },
    select: { imageBase64: true },
  })
  return NextResponse.json({ imageBase64: record?.imageBase64 ?? null })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { resolved } = await req.json().catch(() => ({ resolved: true }))
  const updated = await prisma.doctorHistory.update({
    where: { id },
    data: { resolved, resolvedAt: resolved ? new Date() : null },
  })
  return NextResponse.json({ ok: true, resolvedAt: updated.resolvedAt })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.doctorHistory.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
