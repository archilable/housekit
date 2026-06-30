import { prisma } from '@/lib/db'
import { deleteHistory, deleteInventory } from '@/lib/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DoctorTab from '@/app/components/DoctorTab'

export const dynamic = 'force-dynamic'

function getWarrantyStatus(installedAt: Date | null, warrantyMonths: number | null) {
  if (!installedAt || !warrantyMonths) return null
  const expiry = new Date(installedAt)
  expiry.setMonth(expiry.getMonth() + warrantyMonths)
  const diffDays = Math.ceil((expiry.getTime() - Date.now()) / 86400000)
  if (diffDays < 0) return { label: '보증 만료', color: '#f87171', bg: '#1a0d0d', border: '#3d1a1a' }
  if (diffDays <= 30) return { label: `보증 D-${diffDays}`, color: '#fbbf24', bg: '#1a1200', border: '#3d2e00' }
  return { label: `보증 ${Math.floor(diffDays / 30)}개월`, color: '#34d399', bg: '#0d1f14', border: '#1a3d28' }
}

function calcHealthScore(inventoryCount: number, historyCount: number) {
  return Math.min(40 + Math.min(inventoryCount * 8, 30) + Math.min(historyCount * 6, 30), 100)
}

const CATEGORY_ICONS: Record<string, string> = { 수리: 'ti-tool', 교체: 'ti-refresh', 점검: 'ti-search', 청소: 'ti-sparkles', 기타: 'ti-pin' }
const INVENTORY_ICONS: Record<string, string> = { 보일러: 'ti-flame', 에어컨: 'ti-air-conditioning', 정수기: 'ti-droplet', 냉장고: 'ti-snowflake', 세탁기: 'ti-wash', 도어락: 'ti-lock', 기타: 'ti-package' }
const INVENTORY_COLORS: Record<string, string> = { 보일러: '#f97316', 에어컨: '#60a5fa', 정수기: '#34d399', 냉장고: '#a78bfa', 세탁기: '#38bdf8', 도어락: '#fbbf24', 기타: '#888' }

export default async function HousePage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab = 'home' } = await searchParams

  const house = await prisma.house.findUnique({
    where: { id },
    include: {
      inventories: { orderBy: { installedAt: 'desc' } },
      histories: { orderBy: { doneAt: 'desc' } },
    },
  })
  if (!house) notFound()

  const score = calcHealthScore(house.inventories.length, house.histories.length)
  const scoreColor = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'
  const recentHistories = house.histories.slice(0, 5)

  const s: Record<string, string> = {
    card: 'background:var(--bg-card);border:0.5px solid var(--border);border-radius:16px;',
  }
  void s

  return (
    <div style={{ color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0' }}>
        <Link href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 13 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 18, verticalAlign: -3 }} aria-hidden="true" />
        </Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, background: '#0d1a2e', color: '#60a5fa', padding: '3px 10px', borderRadius: 20, border: '0.5px solid #1e3a5f' }}>
            {house.houseType}
          </span>
          {house.buildYear && <span style={{ fontSize: 11, color: '#555' }}>{house.buildYear}년</span>}
          <Link href={`/houses/${id}/edit`} style={{ color: '#60a5fa', fontSize: 18, textDecoration: 'none' }}>
            <i className="ti ti-pencil" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* House Illustration */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 8px', position: 'relative' }}>
        <svg width="220" height="170" viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="110" cy="162" rx="80" ry="7" fill="#1a1a2e" opacity="0.7" />
          <polygon points="110,22 190,82 30,82" fill="#1a2540" stroke="#2a4a80" strokeWidth="1" />
          <rect x="34" y="82" width="152" height="80" fill="#111828" stroke="#1e3a5f" strokeWidth="0.8" />
          <rect x="50" y="98" width="36" height="28" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.6" rx="2" />
          <line x1="68" y1="98" x2="68" y2="126" stroke="#2a4a80" strokeWidth="0.4" />
          <line x1="50" y1="112" x2="86" y2="112" stroke="#2a4a80" strokeWidth="0.4" />
          <rect x="100" y="98" width="36" height="28" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.6" rx="2" />
          <line x1="118" y1="98" x2="118" y2="126" stroke="#2a4a80" strokeWidth="0.4" />
          <line x1="100" y1="112" x2="136" y2="112" stroke="#2a4a80" strokeWidth="0.4" />
          <rect x="145" y="100" width="26" height="62" fill="#0d1a2e" stroke="#1e3a5f" strokeWidth="0.6" rx="2" />
          <rect x="152" y="118" width="6" height="6" fill="#1e3a5f" rx="1" />
          <rect x="84" y="118" width="28" height="44" fill="#0d1520" stroke="#1e3a5f" strokeWidth="0.5" rx="2" />
          <circle cx="110" cy="22" r="4" fill="#60a5fa" opacity="0.9" />
          <circle cx="60" cy="108" r="14" fill="none" stroke="#1d4ed8" strokeWidth="0.5" opacity="0.4" />
          <circle cx="116" cy="108" r="14" fill="none" stroke="#1d4ed8" strokeWidth="0.5" opacity="0.4" />
          <circle cx="60" cy="108" r="2.5" fill="#60a5fa" opacity="0.7" />
          <circle cx="116" cy="108" r="2.5" fill="#60a5fa" opacity="0.7" />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 180, height: 30, background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* House Name */}
      <div style={{ textAlign: 'center', padding: '0 20px 16px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{house.address}</h1>
        {house.addressDetail && <p style={{ fontSize: 13, color: '#666' }}>{house.addressDetail}</p>}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 }}>
          <span style={{ fontSize: 12, color: '#666' }}>집 건강점수</span>
          <div style={{ width: 100, height: 4, background: '#1a1a2e', borderRadius: 2 }}>
            <div style={{ width: `${score}%`, height: '100%', background: scoreColor, borderRadius: 2, transition: 'width 0.5s' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: scoreColor }}>{score}점</span>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '0.5px solid #1e1e28', marginBottom: 16, padding: '0 20px' }}>
        {[
          { key: 'home', label: '홈' },
          { key: 'inventory', label: `설비 ${house.inventories.length}` },
          { key: 'history', label: `이력 ${house.histories.length}` },
          { key: 'doctor', label: '닥터' },
        ].map((t) => (
          <Link key={t.key} href={`/houses/${id}?tab=${t.key}`} style={{
            flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 13,
            color: tab === t.key ? '#60a5fa' : '#555',
            borderBottom: tab === t.key ? '2px solid #60a5fa' : '2px solid transparent',
            textDecoration: 'none', fontWeight: tab === t.key ? 500 : 400,
            marginBottom: -0.5,
          }}>{t.label}</Link>
        ))}
      </div>

      {/* HOME TAB */}
      {tab === 'home' && (
        <div style={{ padding: '0 16px' }}>
          {/* IoT Status Cards */}
          <p style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>실시간 현황</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {/* Warranty alert card */}
            {(() => {
              const alertItems = house.inventories.filter(i => {
                const w = getWarrantyStatus(i.installedAt, i.warrantyMonths)
                return w && w.color !== '#34d399'
              })
              const alertItem = alertItems[0]
              if (alertItem) {
                const w = getWarrantyStatus(alertItem.installedAt, alertItem.warrantyMonths)!
                return (
                  <div style={{ background: w.bg, border: `0.5px solid ${w.border}`, borderRadius: 14, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: w.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ti ti-alert-triangle" style={{ fontSize: 14, color: w.color }} aria-hidden="true" />
                      </div>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: w.color, marginTop: 4 }} />
                    </div>
                    <p style={{ fontSize: 11, color: '#666' }}>보증 알림</p>
                    <p style={{ fontSize: 16, fontWeight: 500, color: w.color, marginTop: 2 }}>{alertItem.name}</p>
                    <p style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{w.label}</p>
                  </div>
                )
              }
              return (
                <div style={{ background: '#0d1f14', border: '0.5px solid #1a3d28', borderRadius: 14, padding: 14 }}>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1a3d28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-shield-check" style={{ fontSize: 14, color: '#34d399' }} aria-hidden="true" />
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#666' }}>보증 현황</p>
                  <p style={{ fontSize: 16, fontWeight: 500, color: '#34d399', marginTop: 2 }}>정상</p>
                  <p style={{ fontSize: 10, color: '#555', marginTop: 1 }}>만료 예정 없음</p>
                </div>
              )
            })()}

            {/* 총 수리비 */}
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 14 }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1f1000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-wallet" style={{ fontSize: 14, color: '#fbbf24' }} aria-hidden="true" />
                </div>
              </div>
              <p style={{ fontSize: 11, color: '#666' }}>누적 수리비</p>
              <p style={{ fontSize: 16, fontWeight: 500, color: '#fbbf24', marginTop: 2 }}>
                {house.histories.reduce((s, h) => s + (h.cost || 0), 0).toLocaleString()}원
              </p>
              <p style={{ fontSize: 10, color: '#555', marginTop: 1 }}>총 {house.histories.length}건</p>
            </div>

            {/* 설비 수 */}
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 14 }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0d1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-package" style={{ fontSize: 14, color: '#60a5fa' }} aria-hidden="true" />
                </div>
              </div>
              <p style={{ fontSize: 11, color: '#666' }}>등록 설비</p>
              <p style={{ fontSize: 16, fontWeight: 500, color: '#60a5fa', marginTop: 2 }}>{house.inventories.length}개</p>
              <p style={{ fontSize: 10, color: '#555', marginTop: 1 }}>
                {house.inventories.filter(i => getWarrantyStatus(i.installedAt, i.warrantyMonths)).length}개 보증 추적 중
              </p>
            </div>

            {/* 마지막 점검 */}
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 14 }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0d1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-calendar-check" style={{ fontSize: 14, color: '#a78bfa' }} aria-hidden="true" />
                </div>
              </div>
              <p style={{ fontSize: 11, color: '#666' }}>마지막 이력</p>
              <p style={{ fontSize: 16, fontWeight: 500, color: '#a78bfa', marginTop: 2 }}>
                {house.histories[0] ? house.histories[0].doneAt.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '없음'}
              </p>
              <p style={{ fontSize: 10, color: '#555', marginTop: 1 }}>
                {house.histories[0] ? house.histories[0].title : '이력을 추가하세요'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { href: `/houses/${id}/history/new`, icon: 'ti-tool', label: '수리 기록' },
              { href: `/houses/${id}?tab=inventory`, icon: 'ti-package', label: '설비 현황' },
              { href: `/houses/${id}?tab=doctor`, icon: 'ti-stethoscope', label: '하우스 닥터' },
              { href: `/houses/${id}?tab=history`, icon: 'ti-list', label: '전체 이력' },
            ].map(({ href, icon, label }) => (
              <Link key={label} href={href} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px 4px', textAlign: 'center', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <i className={`ti ${icon}`} style={{ fontSize: 20, color: '#60a5fa' }} aria-hidden="true" />
                <span style={{ fontSize: 10, color: '#666' }}>{label}</span>
              </Link>
            ))}
          </div>

          {/* Recent History Timeline */}
          {recentHistories.length > 0 && (
            <>
              <p style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>최근 이력</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {recentHistories.map((h, idx) => {
                  const dotColors: Record<string, string> = { 수리: '#60a5fa', 교체: '#a78bfa', 점검: '#34d399', 청소: '#fbbf24', 기타: '#888' }
                  return (
                    <div key={h.id} style={{ display: 'flex', gap: 12, paddingBottom: idx < recentHistories.length - 1 ? 16 : 0, position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColors[h.category] || '#888', flexShrink: 0, marginTop: 4 }} />
                        {idx < recentHistories.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: '#1e1e28', marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{h.title}</p>
                          <p style={{ fontSize: 11, color: '#555' }}>{h.doneAt.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <p style={{ fontSize: 11, color: '#555', marginTop: 1 }}>
                          {h.company && `${h.company} · `}
                          {h.cost != null ? `${h.cost.toLocaleString()}원` : h.category}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* INVENTORY TAB */}
      {tab === 'inventory' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Link href={`/houses/${id}/inventory/new`} style={{ background: '#1d4ed8', color: '#fff', padding: '8px 16px', borderRadius: 10, fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
              + 설비 추가
            </Link>
          </div>
          {house.inventories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
              <i className="ti ti-package" style={{ fontSize: 40, display: 'block', marginBottom: 8 }} aria-hidden="true" />
              <p>등록된 설비가 없습니다</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {house.inventories.map((item) => {
                const w = getWarrantyStatus(item.installedAt, item.warrantyMonths)
                const iconColor = INVENTORY_COLORS[item.category] || '#888'
                const icon = INVENTORY_ICONS[item.category] || 'ti-package'
                return (
                  <div key={item.id} style={{ background: 'var(--bg-card)', border: `0.5px solid ${w ? w.border : 'var(--border)'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: iconColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`ti ${icon}`} style={{ fontSize: 18, color: iconColor }} aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <p style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</p>
                        {w && <span style={{ fontSize: 10, color: w.color, background: w.bg, padding: '1px 6px', borderRadius: 10, border: `0.5px solid ${w.border}` }}>{w.label}</span>}
                      </div>
                      {item.brand && <p style={{ fontSize: 12, color: '#666' }}>{item.brand} {item.model}</p>}
                      {item.installedAt && <p style={{ fontSize: 11, color: '#444', marginTop: 1 }}>설치 {item.installedAt.toLocaleDateString('ko-KR')}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <a href={`/houses/${id}/inventory/${item.id}/edit`} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 18, padding: 4, textDecoration: 'none' }}>
                        <i className="ti ti-pencil" aria-hidden="true" />
                      </a>
                      <form action={deleteInventory.bind(null, item.id, id)}>
                        <button type="submit" style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 18, padding: 4 }}>
                          <i className="ti ti-trash" aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Link href={`/houses/${id}/history/new`} style={{ background: '#1d4ed8', color: '#fff', padding: '8px 16px', borderRadius: 10, fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
              + 이력 추가
            </Link>
          </div>
          {house.histories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
              <i className="ti ti-clipboard-list" style={{ fontSize: 40, display: 'block', marginBottom: 8 }} aria-hidden="true" />
              <p>등록된 이력이 없습니다</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {house.histories.map((h) => {
                const icon = CATEGORY_ICONS[h.category] || 'ti-pin'
                const catColors: Record<string, string> = { 수리: '#60a5fa', 교체: '#a78bfa', 점검: '#34d399', 청소: '#fbbf24', 기타: '#888' }
                const color = catColors[h.category] || '#888'
                return (
                  <div key={h.id} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`ti ${icon}`} style={{ fontSize: 18, color }} aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <p style={{ fontSize: 14, fontWeight: 500 }}>{h.title}</p>
                        <p style={{ fontSize: 11, color: '#555' }}>{h.doneAt.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      {h.description && <p style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>{h.description}</p>}
                      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#555' }}>
                        {h.company && <span>{h.company}</span>}
                        {h.cost != null && <span>{h.cost.toLocaleString()}원</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <a href={`/houses/${id}/history/${h.id}/edit`} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 18, padding: 4, textDecoration: 'none' }}>
                        <i className="ti ti-pencil" aria-hidden="true" />
                      </a>
                      <form action={deleteHistory.bind(null, h.id, id)}>
                        <button type="submit" style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 18, padding: 4 }}>
                          <i className="ti ti-trash" aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* DOCTOR TAB */}
      {tab === 'doctor' && <DoctorTab houseId={id} />}
    </div>
  )
}
