import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  const me = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email } }) : null
  if (!me?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userId, isAdmin } = await req.json()
  if (userId === me.id) return NextResponse.json({ error: '본인 권한은 변경 불가' }, { status: 400 })

  await prisma.user.update({ where: { id: userId }, data: { isAdmin } })
  return NextResponse.json({ ok: true })
}
