'use client'

interface UtilityMonth {
  month: string
  electric: number | null
  water: number | null
  gas: number | null
  telecom: number | null
}

interface Props {
  data: UtilityMonth[]
  thisMonth: string
}

export default function UtilityChart({ data, thisMonth }: Props) {
  if (data.length === 0) return null

  const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
  const totals = sorted.map(u => (u.electric || 0) + (u.water || 0) + (u.gas || 0) + (u.telecom || 0))
  const maxTotal = Math.max(...totals, 1)

  // SVG 좌표계
  const W = 300
  const TOP = 16      // 금액 레이블 공간
  const BAR_H = 100   // 막대 그래프 높이
  const BOT = 18      // 월 레이블 공간
  const H = TOP + BAR_H + BOT
  const padL = 4
  const padR = 4
  const n = sorted.length
  const colW = (W - padL - padR) / n
  const barW = colW * 0.55

  // 막대 기준선 y
  const baseY = TOP + BAR_H

  // 선형 그래프 포인트 (막대 중앙 상단)
  const points = totals.map((t, i) => {
    const cx = padL + colW * i + colW / 2
    const bH = (t / maxTotal) * BAR_H
    const cy = baseY - bH
    return { cx, cy, t }
  })

  const linePoints = points.map(p => `${p.cx},${p.cy}`).join(' ')
  const areaPoints = [
    `${points[0].cx},${baseY}`,
    ...points.map(p => `${p.cx},${p.cy}`),
    `${points[points.length - 1].cx},${baseY}`,
  ].join(' ')

  return (
    <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 14, padding: 16, marginBottom: 10 }}>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>최근 6개월 추이</p>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 160, display: 'block' }}>

        {/* 가이드 라인 */}
        {[0.25, 0.5, 0.75, 1].map(r => (
          <line key={r} x1={padL} x2={W - padR} y1={baseY - r * BAR_H} y2={baseY - r * BAR_H}
            stroke="#1e1e28" strokeWidth={0.5} />
        ))}

        {/* 막대 */}
        {sorted.map((u, i) => {
          const bH = Math.max((totals[i] / maxTotal) * BAR_H, totals[i] > 0 ? 3 : 0)
          const x = padL + colW * i + (colW - barW) / 2
          const isCurrent = u.month === thisMonth
          return (
            <g key={u.month}>
              {/* 배경 트랙 */}
              <rect x={x} y={TOP} width={barW} height={BAR_H} rx={4} fill="#1a1a2e" />
              {/* 막대 */}
              <rect x={x} y={baseY - bH} width={barW} height={bH} rx={4}
                fill={isCurrent ? '#2563eb' : '#1e3a5f'} opacity={0.9} />
              {/* 금액 */}
              {totals[i] > 0 && (
                <text x={x + barW / 2} y={baseY - bH - 4}
                  textAnchor="middle" fontSize={8} fill={isCurrent ? '#93c5fd' : '#444'}>
                  {(totals[i] / 1000).toFixed(0)}K
                </text>
              )}
              {/* 월 */}
              <text x={x + barW / 2} y={H - 2}
                textAnchor="middle" fontSize={9} fill={isCurrent ? '#60a5fa' : '#555'}>
                {u.month.slice(5)}월
              </text>
            </g>
          )
        })}

        {/* 선형 그래프 — 영역 */}
        {points.length > 1 && (
          <polygon points={areaPoints} fill="rgba(96,165,250,0.08)" />
        )}

        {/* 선형 그래프 — 선 */}
        {points.length > 1 && (
          <polyline points={linePoints} fill="none"
            stroke="#60a5fa" strokeWidth={2}
            strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* 점 */}
        {points.map((p, i) => {
          const isCurrent = sorted[i].month === thisMonth
          return (
            <circle key={i} cx={p.cx} cy={p.cy}
              r={isCurrent ? 5 : 3.5}
              fill={isCurrent ? '#60a5fa' : '#111118'}
              stroke="#60a5fa" strokeWidth={2} />
          )
        })}
      </svg>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#1e3a5f' }} />
          <span style={{ fontSize: 10, color: '#555' }}>월별 합계</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 18, height: 2, background: '#60a5fa', borderRadius: 1 }} />
          <span style={{ fontSize: 10, color: '#555' }}>추이선</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#2563eb' }} />
          <span style={{ fontSize: 10, color: '#60a5fa' }}>이번달</span>
        </div>
      </div>

      {/* 누적 */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #1e1e28', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#555' }}>6개월 누적</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
          {totals.reduce((a, b) => a + b, 0).toLocaleString()}원
        </span>
      </div>
    </div>
  )
}
