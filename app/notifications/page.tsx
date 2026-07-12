import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BackHomeButtons from '@/app/components/BackHomeButtons'

export const revalidate = 60

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

type MaintenanceAlert = {
  title: string
  description: string
  daysUntil: number | null
  level: 'urgent' | 'recommended' | 'info'
  icon: string
  href: string
  houseName: string
}

function generateMaintenanceAlerts(
  house: {
    id: string
    address: string
    buildYear: number | null
    inventories: { name: string; category: string; installedAt: Date | null; warrantyMonths: number | null }[]
    histories: { title: string; category: string; doneAt: Date }[]
  },
  now: Date
): MaintenanceAlert[] {
  const alerts: MaintenanceAlert[] = []
  const houseUrl = `/houses/${house.id}`
  const buildYear = house.buildYear
  const age = buildYear ? now.getFullYear() - buildYear : null

  function daysDiff(target: Date) {
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  function levelFromDays(days: number | null): 'urgent' | 'recommended' | 'info' {
    if (days === null) return 'info'
    if (days < 30) return 'urgent'
    if (days < 90) return 'recommended'
    return 'info'
  }

  // ── 방수 공사 (10년 주기) ──
  if (buildYear && age !== null) {
    const cycleYears = 10
    const yearsIntoCycle = age % cycleYears
    const yearsUntilNext = yearsIntoCycle === 0 ? 0 : cycleYears - yearsIntoCycle
    const nextDue = new Date(now.getFullYear() + yearsUntilNext, 5, 1) // 6월
    const days = daysDiff(nextDue)
    if (days <= 90) {
      alerts.push({
        title: '방수 공사 권장',
        description: `건축 ${age}년차 · ${cycleYears}년 주기 권장`,
        daysUntil: days,
        level: levelFromDays(days),
        icon: '🌧️',
        href: houseUrl,
        houseName: house.address,
      })
    }
  }

  // ── 외벽 도장 (8년 주기) ──
  if (buildYear && age !== null) {
    const cycleYears = 8
    const yearsIntoCycle = age % cycleYears
    const yearsUntilNext = yearsIntoCycle === 0 ? 0 : cycleYears - yearsIntoCycle
    const nextDue = new Date(now.getFullYear() + yearsUntilNext, 3, 1) // 4월
    const days = daysDiff(nextDue)
    if (days <= 90) {
      alerts.push({
        title: '외벽 도장 권장',
        description: `건축 ${age}년차 · ${cycleYears}년 주기 권장`,
        daysUntil: days,
        level: levelFromDays(days),
        icon: '🎨',
        href: houseUrl,
        houseName: house.address,
      })
    }
  }

  // ── 배관 점검 (15년 이상이면 상시 권장) ──
  if (age !== null && age >= 15) {
    alerts.push({
      title: '배관 점검 권장',
      description: `건축 ${age}년차 · 15년 이상 건물은 정기 점검 권장`,
      daysUntil: null,
      level: 'info',
      icon: '🔩',
      href: houseUrl,
      houseName: house.address,
    })
  }

  // ── 보일러 점검 (매년 10월) ──
  const octoberThisYear = new Date(now.getFullYear(), 9, 1) // 10월 1일
  const octoberNextYear = new Date(now.getFullYear() + 1, 9, 1)
  const boilerCheckDue = now < octoberThisYear ? octoberThisYear : octoberNextYear
  const boilerCheckDays = daysDiff(boilerCheckDue)
  if (boilerCheckDays <= 90) {
    alerts.push({
      title: '보일러 점검 권장',
      description: `겨울철 전 (10월) 연례 점검 권장`,
      daysUntil: boilerCheckDays,
      level: levelFromDays(boilerCheckDays),
      icon: '🔥',
      href: houseUrl,
      houseName: house.address,
    })
  }

  // ── 보일러 교체 (설치일 기준 12년) ──
  const boiler = house.inventories.find(inv =>
    inv.category === '보일러' || inv.name.includes('보일러')
  )
  if (boiler?.installedAt) {
    const replaceDue = new Date(boiler.installedAt)
    replaceDue.setFullYear(replaceDue.getFullYear() + 12)
    const days = daysDiff(replaceDue)
    if (days <= 90) {
      const installedYear = boiler.installedAt.getFullYear()
      alerts.push({
        title: '보일러 교체 권장',
        description: `${installedYear}년 설치 · 10~15년 주기 권장`,
        daysUntil: days,
        level: levelFromDays(days),
        icon: '🔥',
        href: `${houseUrl}?tab=inventory`,
        houseName: house.address,
      })
    }
  }

  // ── 에어컨 청소 (마지막 청소 기준 6개월) ──
  const acCleanHistory = house.histories
    .filter(h => h.title.includes('에어컨') || h.category === '에어컨')
    .sort((a, b) => new Date(b.doneAt).getTime() - new Date(a.doneAt).getTime())[0]

  if (acCleanHistory) {
    const cleanDue = new Date(acCleanHistory.doneAt)
    cleanDue.setMonth(cleanDue.getMonth() + 6)
    const days = daysDiff(cleanDue)
    if (days <= 90) {
      alerts.push({
        title: '에어컨 청소 권장',
        description: `마지막 청소 기준 6개월 주기 권장`,
        daysUntil: days,
        level: levelFromDays(days),
        icon: '❄️',
        href: `${houseUrl}?tab=history`,
        houseName: house.address,
      })
    }
  } else {
    // 에어컨 설비가 있는데 청소 이력이 없으면 참고 알림
    const hasAC = house.inventories.some(inv =>
      inv.category === '에어컨' || inv.name.includes('에어컨')
    )
    if (hasAC) {
      alerts.push({
        title: '에어컨 청소 권장',
        description: '에어컨 청소 이력이 없어요 · 6개월 주기 권장',
        daysUntil: null,
        level: 'info',
        icon: '❄️',
        href: `${houseUrl}?tab=history`,
        houseName: house.address,
      })
    }
  }

  return alerts
}

const LEVEL_CONFIG = {
  urgent: { label: '긴급', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.3)' },
  recommended: { label: '권장', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.3)' },
  info: { label: '참고', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
}

function formatDaysUntil(days: number | null): string {
  if (days === null) return '확인 권장'
  if (days < 0) return `${Math.abs(days)}일 경과`
  if (days === 0) return '오늘'
  if (days < 30) return `${days}일 후`
  return `${Math.floor(days / 30)}개월 후`
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
    histories: {
      orderBy: { doneAt: 'desc' as const },
      take: 50,
      select: { id: true, title: true, category: true, doneAt: true, houseId: true },
    },
    doctorHistories: {
      orderBy: { createdAt: 'desc' as const },
      take: 5,
      select: { id: true, description: true, result: true, createdAt: true, houseId: true },
    },
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
    id: string
    title: string
    daysAgo: number
    href: string
    houseName: string
    isDoctor?: boolean
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
          id: hist.id,
          title: hist.title,
          daysAgo,
          href: `/houses/${house.id}?tab=history&highlight=${hist.id}`,
          houseName: house.address,
        })
      }
    }

    for (const dh of house.doctorHistories) {
      const daysAgo = Math.floor((now.getTime() - new Date(dh.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo <= 14) {
        const firstLine = (dh.description || dh.result || '').split('\n')[0].slice(0, 40)
        recentHistories.push({
          id: dh.id,
          title: firstLine || 'AI 하우스닥터 진단',
          daysAgo,
          href: `/houses/${house.id}?tab=doctor&highlight=${dh.id}`,
          houseName: house.address,
          isDoctor: true,
        })
      }
    }

  }

  recentHistories.sort((a, b) => a.daysAgo - b.daysAgo)
  warrantyItems.sort((a, b) => a.daysLeft - b.daysLeft)

  const expiredItems = warrantyItems.filter(i => i.daysLeft < 0)
  const activeItems = warrantyItems.filter(i => i.daysLeft >= 0)

  const hasAnything = warrantyItems.length > 0 || recentHistories.length > 0

  return (
    <div style={{ padding: '24px 20px 100px', maxWidth: 480, margin: '0 auto' }}>
      {houseId && (
        <div style={{ marginBottom: 20 }}>
          <BackHomeButtons houseId={houseId} />
        </div>
      )}
      <p style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>알림</p>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>{warrantyOnly ? '보증 관리' : '알림 센터'}</h1>

      {!hasAnything ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', color: '#444' }}>
          <div style={{ fontSize: 50, marginBottom: 16 }}>🔔</div>
          <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>새 알림이 없어요</p>
          <p style={{ fontSize: 15, color: '#555' }}>설비에 보증기간을 등록하면 여기서 관리할 수 있어요</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* ── 맞춤 알림 안내 ── */}
          {!warrantyOnly && (
            <div style={{ background: 'linear-gradient(135deg, #0d1520 0%, #111118 100%)', border: '0.5px solid #1e2a3a', borderRadius: 18, padding: '24px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>🔔</div>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>맞춤 알림을 준비 중이에요</p>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 20 }}>
                설비와 수리 이력을 입력하면<br />
                실제 데이터 기반으로 알림을 드려요.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '🛠️', text: '에어컨 청소 이력 → 6개월 후 재청소 알림' },
                  { icon: '🔥', text: '보일러 설치일 → 점검 시기 알림' },
                  { icon: '📦', text: '설비 보증기간 → 만료 전 알림' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 14px' }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <p style={{ fontSize: 13, color: '#666' }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 보증 유효 중인 설비 ── */}
          {activeItems.length > 0 && (
            <div>
              <p style={{ fontSize: 13, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>보증 추적 중 ({activeItems.length}개)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeItems.map((item, i) => {
                  const color = getWarrantyColor(item.daysLeft)
                  const expiryStr = item.expiryDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                  return (
                    <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
                      <div style={{ background: getWarrantyBg(item.daysLeft), border: `0.5px solid ${getWarrantyBorder(item.daysLeft)}`, borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                          {CATEGORY_ICON[item.category] || '🔧'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                            {item.name}
                            {item.brand && <span style={{ fontSize: 13, color: '#555', fontWeight: 400, marginLeft: 6 }}>{item.brand}</span>}
                          </p>
                          <p style={{ fontSize: 13, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.houseName}</p>
                          <p style={{ fontSize: 12, color: '#444', marginTop: 2 }}>만료 {expiryStr}</p>
                        </div>
                        <div style={{ background: color + '20', color, borderRadius: 10, padding: '5px 10px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'center', flexShrink: 0 }}>
                          {formatTimeLeft(item.daysLeft)}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── 보증 만료된 설비 ── */}
          {expiredItems.length > 0 && (
            <div>
              <p style={{ fontSize: 13, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>보증 만료됨 ({expiredItems.length}개)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {expiredItems.map((item, i) => {
                  const expiryStr = item.expiryDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                  return (
                    <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
                      <div style={{ background: 'rgba(248,113,113,0.05)', border: '0.5px solid rgba(248,113,113,0.2)', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', opacity: 0.8 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f8717120', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                          {CATEGORY_ICON[item.category] || '🔧'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 16, fontWeight: 600, color: '#aaa', marginBottom: 2 }}>
                            {item.name}
                            {item.brand && <span style={{ fontSize: 13, color: '#444', fontWeight: 400, marginLeft: 6 }}>{item.brand}</span>}
                          </p>
                          <p style={{ fontSize: 13, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.houseName}</p>
                          <p style={{ fontSize: 12, color: '#333', marginTop: 2 }}>만료 {expiryStr}</p>
                        </div>
                        <div style={{ background: '#f8717120', color: '#f87171', borderRadius: 10, padding: '5px 10px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'center', flexShrink: 0 }}>
                          {formatTimeLeft(item.daysLeft)}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── 최근 이력 ── */}
          {!warrantyOnly && recentHistories.length > 0 && (
            <div>
              <p style={{ fontSize: 13, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>최근 이력 (14일)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentHistories.map((h, i) => (
                  <Link key={i} href={h.href} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#111118', border: `0.5px solid ${h.isDoctor ? '#1a2a1a' : '#1e1e28'}`, borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: h.isDoctor ? 'rgba(52,211,153,0.1)' : 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                        {h.isDoctor ? '🩺' : '🔧'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</p>
                        <p style={{ fontSize: 13, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.houseName}{h.isDoctor && <span style={{ marginLeft: 6, color: '#34d399', fontSize: 12 }}>AI 진단</span>}</p>
                      </div>
                      <div style={{ color: h.isDoctor ? '#34d399' : '#60a5fa', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
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

function MaintenanceCard({ alert }: { alert: MaintenanceAlert }) {
  const cfg = LEVEL_CONFIG[alert.level]
  return (
    <Link href={alert.href} style={{ textDecoration: 'none' }}>
      <div style={{ background: cfg.bg, border: `0.5px solid ${cfg.border}`, borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: cfg.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {alert.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{alert.title}</p>
          <p style={{ fontSize: 13, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.houseName}</p>
          <p style={{ fontSize: 12, color: '#444', marginTop: 2 }}>{alert.description}</p>
        </div>
        <div style={{ background: cfg.color + '20', color: cfg.color, borderRadius: 10, padding: '5px 10px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'center', flexShrink: 0 }}>
          {formatDaysUntil(alert.daysUntil)}
        </div>
      </div>
    </Link>
  )
}
