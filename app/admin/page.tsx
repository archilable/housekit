import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'archiry@archilable.com'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    redirect('/houses')
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      houses: { select: { id: true } },
      houseAccess: { select: { id: true } },
    },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayUsers = users.filter(u => u.createdAt && new Date(u.createdAt) >= today)
  const totalHouses = await prisma.house.count()

  return (
    <div style={{ padding: '24px 16px 100px', maxWidth: 480, margin: '0 auto' }}>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>관리자</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>HouseKit Admin</h1>

      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
        <div style={{ background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#60a5fa' }}>{users.length}</p>
          <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>전체 가입자</p>
        </div>
        <div style={{ background: '#0d1f14', border: '0.5px solid #1a3d28', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#34d399' }}>{todayUsers.length}</p>
          <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>오늘 가입</p>
        </div>
        <div style={{ background: '#1a0f00', border: '0.5px solid #3d2000', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#f97316' }}>{totalHouses}</p>
          <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>등록 자산</p>
        </div>
      </div>

      {/* 가입자 목록 */}
      <p style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>가입자 목록</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {users.map((user) => {
          const isToday = user.createdAt && new Date(user.createdAt) >= today
          const joinDate = user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '—'
          return (
            <div key={user.id} style={{
              background: isToday ? '#0d1f14' : 'var(--bg-card)',
              border: isToday ? '0.5px solid #1a3d28' : '0.5px solid var(--border)',
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: isToday ? '#34d39922' : '#60a5fa22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {user.image
                  ? <img src={user.image} width={40} height={40} style={{ borderRadius: 12, objectFit: 'cover' }} alt="" />
                  : <i className="ti ti-user" style={{ color: isToday ? '#34d399' : '#60a5fa' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{user.name || '이름 없음'}</p>
                  {isToday && <span style={{ fontSize: 10, color: '#34d399', background: '#0d1f14', border: '0.5px solid #1a3d28', padding: '1px 6px', borderRadius: 8 }}>NEW</span>}
                </div>
                <p style={{ fontSize: 12, color: '#555' }}>{user.email}</p>
                <p style={{ fontSize: 11, color: '#444', marginTop: 2 }}>
                  {joinDate} · 자산 {user.houses.length}개{user.houseAccess.length > 0 ? ` (+${user.houseAccess.length} 공유)` : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
