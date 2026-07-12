import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ ok: false })

  await prisma.user.update({
    where: { email: session.user.email },
    data: { lastSeenAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
