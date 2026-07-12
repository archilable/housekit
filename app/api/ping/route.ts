import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ ok: false })

  await prisma.$executeRawUnsafe(
    `UPDATE User SET lastSeenAt = ? WHERE email = ?`,
    new Date().toISOString(),
    session.user.email,
  ).catch(() => {})

  return NextResponse.json({ ok: true })
}
