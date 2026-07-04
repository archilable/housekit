import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await prisma.$queryRawUnsafe('ALTER TABLE "History" ADD COLUMN "inventoryId" TEXT')
    return NextResponse.json({ ok: true, message: 'migration applied' })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('duplicate column') || msg.includes('already exists')) {
      return NextResponse.json({ ok: true, message: 'column already exists' })
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
