import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const houses = await prisma.house.findMany({
    where: { userId },
    include: {
      inventories: true,
      histories: { orderBy: { doneAt: 'desc' }, take: 5 },
    },
  })

  const now = new Date()

  type Notification = {
    type: 'warning' | 'info' | 'recent'
    title: string
    body: string
    href: string
    daysLeft?: number
  }

  const notifications: Notification[] = []

  for (const house of houses) {
    // 보증 만료 알림
    for (const inv of house.inventories) {
      if (!inv.installedAt || !inv.warrantyMonths) continue
      const expiry = new Date(inv.installedAt)
      expiry.setMonth(expiry.getMonth() + inv.warrantyMonths)
      const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysLeft <= 90 && daysLeft > 0) {
        notifications.push({
          type: 'warning',
          title: `보증 만료 임박 — ${inv.name}`,
          body: `${house.address} · ${daysLeft}일 후 만료`,
          href: `/houses/${house.id}?tab=inventory&highlight=${inv.id}`,
          daysLeft,
        })
      } else if (daysLeft <= 0 && daysLeft > -30) {
        notifications.push({
          type: 'warning',
          title: `보증 만료됨 — ${inv.name}`,
          body: `${house.address} · ${Math.abs(daysLeft)}일 전 만료`,
          href: `/houses/${house.id}?tab=inventory&highlight=${inv.id}`,
          daysLeft,
        })
      }
    }

    // 최근 이력 알림
    for (const hist of house.histories) {
      const daysAgo = Math.floor((now.getTime() - new Date(hist.doneAt).getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo <= 14) {
        notifications.push({
          type: 'recent',
          title: `최근 수리 이력 — ${hist.title}`,
          body: `${house.address} · ${daysAgo === 0 ? '오늘' : `${daysAgo}일 전`}`,
          href: `/houses/${house.id}?tab=history`,
        })
      }
    }
  }

  // 보증 만료 임박 → 최근 이력 순 정렬
  notifications.sort((a, b) => {
    if (a.type === 'warning' && b.type !== 'warning') return -1
    if (b.type === 'warning' && a.type !== 'warning') return 1
    return (a.daysLeft ?? 999) - (b.daysLeft ?? 999)
  })

  return (
    <div style={{ padding: '24px 20px 100px', maxWidth: 480, margin: '0 auto' }}>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>알림</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>알림 센터</h1>

      {notifications.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '50vh', textAlign: 'center', color: '#444',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>새 알림이 없어요</p>
          <p style={{ fontSize: 13, color: '#555' }}>보증 만료 임박 또는 최근 수리 이력이 있으면 여기에 표시돼요</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map((n, i) => (
            <Link key={i} href={n.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: n.type === 'warning' ? 'rgba(251,191,36,0.06)' : '#111118',
                border: `0.5px solid ${n.type === 'warning' ? '#92400e' : '#1e1e28'}`,
                borderRadius: 16, padding: '16px 18px',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: n.type === 'warning' ? 'rgba(251,191,36,0.12)' : 'rgba(96,165,250,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {n.type === 'warning' ? '⚠️' : '🔧'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 600,
                    color: n.type === 'warning' ? '#fbbf24' : '#fff',
                    marginBottom: 4,
                  }}>{n.title}</p>
                  <p style={{ fontSize: 12, color: '#555' }}>{n.body}</p>
                </div>
                {n.type === 'warning' && n.daysLeft !== undefined && (
                  <div style={{
                    background: n.daysLeft <= 0 ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)',
                    color: n.daysLeft <= 0 ? '#f87171' : '#fbbf24',
                    borderRadius: 8, padding: '4px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                  }}>
                    {n.daysLeft <= 0 ? '만료됨' : `D-${n.daysLeft}`}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
