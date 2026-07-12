import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function POST() {
  const session = await auth()
  const me = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null
  if (!me?.isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  await prisma.$executeRawUnsafe(
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSeenAt" DATETIME`
  )
  return NextResponse.json({ ok: true })
}
