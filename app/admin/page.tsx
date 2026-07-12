import { prisma } from '@/lib/db'
import { auth, signIn } from '@/auth'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0a0a0f', padding: '0 32px', textAlign: 'center',
        }}>
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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>접근 권한 없음</h1>
          <p style={{ fontSize: 16, color: '#555' }}>{session.user.email}</p>
        </div>
      )
    }

    // lastSeenAt 컬럼 추가
    await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN lastSeenAt DATETIME`).catch(() => {})

    const prismaUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        houses: { select: { id: true, address: true } },
        houseAccess: { select: { id: true, house: { select: { address: true } } } },
        accounts: { select: { provider: true } },
      },
    })

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

    // 최근 활동 피드 (이력 + 설비, 최근 30개)
    const recentHistories = await prisma.history.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        id: true, title: true, category: true, createdAt: true,
        house: { select: { address: true, userId: true } },
      },
    })
    const recentInventories = await prisma.inventory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        id: true, name: true, category: true, createdAt: true,
        house: { select: { address: true, userId: true } },
      },
    })

    // userId → user 맵
    const userMap: Record<string, { name: string | null; image: string | null }> = {}
    for (const u of prismaUsers) userMap[u.id] = { name: u.name, image: u.image }

    type ActivityItem = {
      id: string
      type: 'history' | 'inventory'
      title: string
      category: string
      address: string
      userName: string | null
      userImage: string | null
      createdAt: Date
    }

    const activities: ActivityItem[] = [
      ...recentHistories.map(h => ({
        id: h.id, type: 'history' as const,
        title: h.title, category: h.category,
        address: h.house.address,
        userName: h.house.userId ? (userMap[h.house.userId]?.name ?? null) : null,
        userImage: h.house.userId ? (userMap[h.house.userId]?.image ?? null) : null,
        createdAt: h.createdAt,
      })),
      ...recentInventories.map(i => ({
        id: i.id, type: 'inventory' as const,
        title: i.name, category: i.category,
        address: i.house.address,
        userName: i.house.userId ? (userMap[i.house.userId]?.name ?? null) : null,
        userImage: i.house.userId ? (userMap[i.house.userId]?.image ?? null) : null,
        createdAt: i.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 30)

    return <AdminClient users={users} todayCount={todayCount} totalHouses={totalHouses} myId={me.id} activities={activities} />
  } catch (e) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#f87171', padding: 32, textAlign: 'center' }}>
        <div>
          <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>오류 발생</p>
          <p style={{ fontSize: 14, color: '#555' }}>{String(e)}</p>
        </div>
      </div>
    )
  }
}
