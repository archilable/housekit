import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { ids } = await req.json() as { ids: string[] }
  await Promise.all(ids.map((id, i) => prisma.house.update({ where: { id }, data: { sortOrder: i } })))
  return NextResponse.json({ ok: true })
}
