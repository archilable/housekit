import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BackHomeButtons from '@/app/components/BackHomeButtons'

export const dynamic = 'force-dynamic'

function formatTimeLeft(daysLeft: number): string {
  if (daysLeft < 0) {
    const abs = Math.abs(daysLeft)
    if (abs >= 30) return `만료됨 (${Math.floor(abs / 30)}개월 전)`
    return `만료됨 (${abs}일 전)`
  }
  if (daysLeft >= 180) return `${Math.floor(daysLeft / 30)}개월 후 만료`
  if (daysLeft >= 30) return `${Math.floor(daysLeft / 30)}개월 후 만료`
  return `${daysLeft}일 후 만료`
}

function getWarrantyColor(daysLeft: number): string {
  if (daysLeft < 0) return '#f87171'
  if (daysLeft <= 90) return '#f97316'
  if (daysLeft <= 180) return '#fbbf24'
  return '#34d399'
}

function getWarrantyBg(daysLeft: number): string {
  if (daysLeft < 0) return 'rgba(248,113,113,0.08)'
  if (daysLeft <= 90) return 'rgba(249,115,22,0.08)'
  if (daysLeft <= 180) return 'rgba(251,191,36,0.08)'
  return 'rgba(52,211,153,0.08)'
}

function getWarrantyBorder(daysLeft: number): string {
  if (daysLeft < 0) return 'rgba(248,113,113,0.3)'
  if (daysLeft <= 90) return 'rgba(249,115,22,0.3)'
  if (daysLeft <= 180) return 'rgba(251,191,36,0.3)'
  return 'rgba(52,211,153,0.2)'
}

const CATEGORY_ICON: Record<string, string> = {
  보일러: '🔥', 에어컨: '❄️', 정수기: '💧', 냉장고: '🧊',
  세탁기: '🫧', 건조기: '💨', 도어락: '🔐', 기타: '🔧',
}

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ warranty?: string; houseId?: string }> }) {
  const { warranty, houseId } = await searchParams
  const warrantyOnly = warranty === '1'
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const houseInclude = {
    inventories: {
      select: { id: true, name: true, category: true, brand: true, installedAt: true, warrantyMonths: true, houseId: true },
    },
    histories: { orderBy: { doneAt: 'desc' as const }, take: 5, select: { id: true, title: true, category: true, doneAt: true, houseId: true } },
  }

  const [ownedHouses, sharedAccess] = await Promise.all([
    prisma.house.findMany({ where: { userId }, include: houseInclude }),
    prisma.houseAccess.findMany({ where: { userId }, include: { house: { include: houseInclude } } }),
  ])
  const houses = [...ownedHouses, ...sharedAccess.map(a => a.house)]

  const now = new Date()

  type WarrantyItem = {
    name: string
    category: string
    brand: string | null
    daysLeft: number
    expiryDate: Date
    href: string
    houseName: string
  }

  type RecentHistory = {
    title: string
    daysAgo: number
    href: string
    houseName: string
  }

  const warrantyItems: WarrantyItem[] = []
  const recentHistories: RecentHistory[] = []

  for (const house of houses) {
    for (const inv of house.inventories) {
      if (!inv.installedAt || !inv.warrantyMonths) continue
      const expiry = new Date(inv.installedAt)
      expiry.setMonth(expiry.getMonth() + inv.warrantyMonths)
      const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      warrantyItems.push({
        name: inv.name,
        category: inv.category,
        brand: inv.brand,
        daysLeft,
        expiryDate: expiry,
        href: `/houses/${house.id}?tab=inventory&highlight=${inv.id}`,
        houseName: house.address,
      })
    }

    for (const hist of house.histories) {
      const daysAgo = Math.floor((now.getTime() - new Date(hist.doneAt).getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo <= 14) {
        recentHistories.push({
          title: hist.title,
          daysAgo,
          href: `/houses/${house.id}?tab=history`,
          houseName: house.address,
        })
      }
    }
  }

  // 만료 임박 순 정렬 (만료된 것은 최근 것 먼저)
  warrantyItems.sort((a, b) => a.daysLeft - b.daysLeft)

  const expiredItems = warrantyItems.filter(i => i.daysLeft < 0)
  const activeItems = warrantyItems.filter(i => i.daysLeft >= 0)

  return (
    <div style={{ padding: '24px 20px 100px', maxWidth: 480, margin: '0 auto' }}>
      {houseId && (
        <div style={{ marginBottom: 20 }}>
          <BackHomeButtons houseId={houseId} />
        </div>
      )}
      <p style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>알림</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>{warrantyOnly ? '보증 관리' : '알림 센터'}</h1>

      {warrantyItems.length === 0 && recentHistories.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', color: '#444' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>새 알림이 없어요</p>
          <p style={{ fontSize: 13, color: '#555' }}>설비에 보증기간을 등록하면 여기서 관리할 수 있어요</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* 보증 유효 중인 설비 */}
          {activeItems.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>보증 추적 중 ({activeItems.length}개)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeItems.map((item, i) => {
                  const color = getWarrantyColor(item.daysLeft)
                  const expiryStr = item.expiryDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                  return (
                    <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
                      <div style={{ background: getWarrantyBg(item.daysLeft), border: `0.5px solid ${getWarrantyBorder(item.daysLeft)}`, borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          {CATEGORY_ICON[item.category] || '🔧'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                            {item.name}
                            {item.brand && <span style={{ fontSize: 11, color: '#555', fontWeight: 400, marginLeft: 6 }}>{item.brand}</span>}
                          </p>
                          <p style={{ fontSize: 11, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.houseName}</p>
                          <p style={{ fontSize: 10, color: '#444', marginTop: 2 }}>만료 {expiryStr}</p>
                        </div>
                        <div style={{ background: color + '20', color, borderRadius: 10, padding: '5px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'center', flexShrink: 0 }}>
                          {formatTimeLeft(item.daysLeft)}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* 보증 만료된 설비 */}
          {expiredItems.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>보증 만료됨 ({expiredItems.length}개)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {expiredItems.map((item, i) => {
                  const expiryStr = item.expiryDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                  return (
                    <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
                      <div style={{ background: 'rgba(248,113,113,0.05)', border: '0.5px solid rgba(248,113,113,0.2)', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', opacity: 0.8 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f8717120', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          {CATEGORY_ICON[item.category] || '🔧'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#aaa', marginBottom: 2 }}>
                            {item.name}
                            {item.brand && <span style={{ fontSize: 11, color: '#444', fontWeight: 400, marginLeft: 6 }}>{item.brand}</span>}
                          </p>
                          <p style={{ fontSize: 11, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.houseName}</p>
                          <p style={{ fontSize: 10, color: '#333', marginTop: 2 }}>만료 {expiryStr}</p>
                        </div>
                        <div style={{ background: '#f8717120', color: '#f87171', borderRadius: 10, padding: '5px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'center', flexShrink: 0 }}>
                          {formatTimeLeft(item.daysLeft)}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* 최근 이력 */}
          {!warrantyOnly && recentHistories.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>최근 이력 (14일)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentHistories.map((h, i) => (
                  <Link key={i} href={h.href} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        🔧
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{h.title}</p>
                        <p style={{ fontSize: 11, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.houseName}</p>
                      </div>
                      <div style={{ color: '#60a5fa', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                        {h.daysAgo === 0 ? '오늘' : `${h.daysAgo}일 전`}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
