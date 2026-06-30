import { prisma } from '@/lib/db'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const houses = await prisma.house.findMany({
    include: {
      utilities: { orderBy: { month: 'desc' }, take: 7 },
      valuation: true,
      _count: { select: { histories: true, inventories: true } },
    },
  })

  const fmt = (n: number) => n >= 100000000
    ? `${(n / 100000000).toFixed(1)}억`
    : n >= 10000
    ? `${Math.round(n / 10000).toLocaleString()}만원`
    : n.toLocaleString() + '원'

  function calcEstimated(house: typeof houses[0]) {
    const v = house.valuation
    if (!v) return null
    if (house.houseType === '아파트' && v.officialPrice) {
      return Math.round(v.officialPrice / (v.priceRatio ?? 0.70))
    }
    if (v.landPrice && v.landArea) {
      const landVal = Math.round(v.landPrice * v.landArea * (v.landShare ?? 1.0))
      const age = new Date().getFullYear() - (house.buildYear ?? new Date().getFullYear())
      const depr = Math.max(1 - (v.deprRate ?? 0.02) * age, 0.2)
      const buildVal = v.buildCostPerSqm && v.buildArea ? Math.round(v.buildCostPerSqm * v.buildArea * depr) : 0
      return landVal + buildVal
    }
    return null
  }

  const totalAssets = houses.reduce((sum, h) => sum + (calcEstimated(h) ?? 0), 0)

  const thisMonth = new Date().toISOString().slice(0, 7)

  return (
    <div style={{ padding: '24px 16px 0', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>분석</p>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>자산 분석</h1>
      </div>

      {/* 총 자산 카드 */}
      {totalAssets > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #0d1a2e 0%, #111828 100%)', border: '0.5px solid #1e3a5f', borderRadius: 20, padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>총 부동산 자산 추정</p>
          <p style={{ fontSize: 34, fontWeight: 700, color: '#fff', letterSpacing: -1, marginBottom: 4 }}>{fmt(totalAssets)}</p>
          <p style={{ fontSize: 12, color: '#555' }}>{houses.filter(h => calcEstimated(h) != null).length}개 주택 합산 · 참고용</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {houses.map(h => {
              const est = calcEstimated(h)
              if (!est) return null
              return (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>{h.address}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#60a5fa', flexShrink: 0 }}>{fmt(est)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p style={{ fontSize: 13, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>공과금 분석</p>

      {houses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <i className="ti ti-chart-bar" style={{ fontSize: 40, display: 'block', marginBottom: 8 }} />
          <p>등록된 주택이 없습니다</p>
        </div>
      ) : (
        houses.map(house => {
          const thisUtil = house.utilities.find(u => u.month === thisMonth)
          const prevMonth = (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7) })()
          const prevUtil = house.utilities.find(u => u.month === prevMonth)
          const sorted = [...house.utilities].sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
          const totals = sorted.map(u => (u.electric || 0) + (u.water || 0) + (u.gas || 0) + (u.telecom || 0))
          const maxTotal = Math.max(...totals, 1)
          const thisTotal = thisUtil ? (thisUtil.electric || 0) + (thisUtil.water || 0) + (thisUtil.gas || 0) + (thisUtil.telecom || 0) : null
          const prevTotal = prevUtil ? (prevUtil.electric || 0) + (prevUtil.water || 0) + (prevUtil.gas || 0) + (prevUtil.telecom || 0) : null
          const diff = thisTotal != null && prevTotal != null ? thisTotal - prevTotal : null

          return (
            <div key={house.id} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500 }}>{house.address}</p>
                  <p style={{ fontSize: 11, color: '#555' }}>{house.houseType}</p>
                </div>
                <Link href={`/houses/${house.id}?tab=utility`} style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', background: '#0d1a2e', padding: '6px 12px', borderRadius: 8, border: '0.5px solid #1e3a5f' }}>
                  입력하기
                </Link>
              </div>

              {/* 이번달 vs 전달 */}
              {thisTotal != null && (
                <div style={{ background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 14, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#60a5fa', marginBottom: 4 }}>이번달 합계</p>
                      <p style={{ fontSize: 24, fontWeight: 600, color: '#fff' }}>{thisTotal.toLocaleString()}원</p>
                    </div>
                    {diff != null && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>전월 대비</p>
                        <p style={{ fontSize: 16, fontWeight: 500, color: diff > 0 ? '#f87171' : '#34d399' }}>
                          {diff > 0 ? '▲ +' : '▼ '}{diff.toLocaleString()}원
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 항목별 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
                    {[
                      { label: '전기세', icon: 'ti-bolt', color: '#fbbf24', val: thisUtil?.electric, prev: prevUtil?.electric },
                      { label: '수도세', icon: 'ti-droplet', color: '#60a5fa', val: thisUtil?.water, prev: prevUtil?.water },
                      { label: '가스비', icon: 'ti-flame', color: '#f97316', val: thisUtil?.gas, prev: prevUtil?.gas },
                      { label: '통신비', icon: 'ti-wifi', color: '#34d399', val: thisUtil?.telecom, prev: prevUtil?.telecom },
                    ].map(({ label, icon, color, val, prev }) => {
                      const d = val != null && prev != null ? val - prev : null
                      return (
                        <div key={label} style={{ background: '#111828', borderRadius: 10, padding: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <i className={`ti ${icon}`} style={{ fontSize: 14, color }} />
                            {d != null && <span style={{ fontSize: 9, color: d > 0 ? '#f87171' : '#34d399' }}>{d > 0 ? '▲' : '▼'}{Math.abs(d / 1000).toFixed(0)}K</span>}
                          </div>
                          <p style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>{label}</p>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{val != null ? val.toLocaleString() + '원' : '—'}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 바 차트 */}
              {sorted.length > 0 && (
                <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 14, padding: 16, marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: '#666', marginBottom: 14 }}>최근 6개월 추이</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
                    {sorted.map((u, i) => (
                      <div key={u.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 9, color: '#555' }}>{totals[i] > 0 ? (totals[i] / 1000).toFixed(0) + 'K' : ''}</span>
                        <div style={{ width: '100%', background: '#1a1a2e', borderRadius: 4, flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                          <div style={{
                            width: '100%',
                            background: u.month === thisMonth ? '#1d4ed8' : '#1e3a5f',
                            borderRadius: 4,
                            height: `${(totals[i] / maxTotal) * 100}%`,
                            minHeight: totals[i] > 0 ? 4 : 0,
                            transition: 'height 0.3s',
                          }} />
                        </div>
                        <span style={{ fontSize: 9, color: u.month === thisMonth ? '#60a5fa' : '#444' }}>{u.month.slice(5)}월</span>
                      </div>
                    ))}
                  </div>

                  {/* 누적 합계 */}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #1e1e28', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#555' }}>등록 기간 누적</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fbbf24' }}>
                      {totals.reduce((a, b) => a + b, 0).toLocaleString()}원
                    </span>
                  </div>
                </div>
              )}

              {house.utilities.length === 0 && (
                <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 14, padding: 24, textAlign: 'center', color: '#555' }}>
                  <i className="ti ti-bolt" style={{ fontSize: 28, display: 'block', marginBottom: 6 }} />
                  <p style={{ fontSize: 13 }}>공과금 데이터가 없어요</p>
                </div>
              )}

              <div style={{ height: 1, background: '#1e1e28', marginTop: 8 }} />
            </div>
          )
        })
      )}
    </div>
  )
}
