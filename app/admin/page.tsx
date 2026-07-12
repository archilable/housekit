import { prisma } from '@/lib/db'
import { auth, signIn } from '@/auth'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.email) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0f', padding: '0 32px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          top: '5%', left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }} />
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #1e1e3a 0%, #0d0d1f 100%)',
            border: '0.5px solid #2a2a5a', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <i className="ti ti-shield-lock" style={{ fontSize: 34, color: '#818cf8' }} />
          </div>
          <p style={{ fontSize: 14, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>HouseKit</p>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: '#fff', marginBottom: 8 }}>관리자 센터</h1>
          <p style={{ fontSize: 16, color: '#555' }}>관리자 권한이 있는 계정으로 로그인하세요</p>
        </div>
        <form action={async () => {
          'use server'
          await signIn('google', { redirectTo: '/admin' })
        }}>
          <button type="submit" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#fff', color: '#111', border: 'none',
            borderRadius: 14, padding: '14px 28px', fontSize: 17,
            fontWeight: 600, cursor: 'pointer', width: '100%', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </button>
        </form>
      </div>
    )
  }

  const me = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!me?.isAdmin) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0f', padding: '0 32px', textAlign: 'center',
      }}>
        <i className="ti ti-lock" style={{ fontSize: 50, color: '#f87171', marginBottom: 16 }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>접근 권한 없음</h1>
        <p style={{ fontSize: 16, color: '#555' }}>{session.user.email}</p>
        <p style={{ fontSize: 15, color: '#444', marginTop: 8 }}>관리자에게 권한 요청하세요</p>
      </div>
    )
  }

  // lastSeenAt 컬럼 자동 추가 (이미 있으면 에러 무시)
  await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN lastSeenAt DATETIME`).catch(() => {})

  const prismaUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      houses: { select: { id: true, address: true } },
      houseAccess: { select: { id: true, house: { select: { address: true } } } },
      accounts: { select: { provider: true } },
    },
  })

  // lastSeenAt raw 조회 후 병합
  const rawRows = await prisma.$queryRawUnsafe<{ id: string; lastSeenAt: string | null }[]>(
    `SELECT id, lastSeenAt FROM User`
  ).catch(() => [] as { id: string; lastSeenAt: string | null }[])
  const lastSeenMap: Record<string, Date | null> = {}
  for (const r of rawRows) {
    lastSeenMap[r.id] = r.lastSeenAt ? new Date(r.lastSeenAt) : null
  }

  const users = prismaUsers
    .map(u => ({ ...u, lastSeenAt: lastSeenMap[u.id] ?? null }))
    .sort((a, b) => (b.lastSeenAt?.getTime() ?? 0) - (a.lastSeenAt?.getTime() ?? 0))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayCount = prismaUsers.filter(u => u.createdAt && new Date(u.createdAt) >= today).length
  const totalHouses = await prisma.house.count()

  return <AdminClient users={users} todayCount={todayCount} totalHouses={totalHouses} myId={me.id} />
}
