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

  const W = 320
  const H = 120
  const BAR_AREA_H = 90
  const padL = 8
  const padR = 8
  const colW = (W - padL - padR) / sorted.length

  // 선형 그래프 포인트
  const points = totals.map((t, i) => {
    const x = padL + colW * i + colW / 2
    const y = BAR_AREA_H - (t / maxTotal) * (BAR_AREA_H - 10) + 5
    return { x, y, t, month: sorted[i].month }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 14, padding: 16, marginBottom: 10 }}>
      <p style={{ fontSize: 11, color: '#666', marginBottom: 14 }}>최근 6개월 추이</p>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* 막대 */}
        {sorted.map((u, i) => {
          const barH = Math.max((totals[i] / maxTotal) * (BAR_AREA_H - 10), totals[i] > 0 ? 4 : 0)
          const x = padL + colW * i + colW * 0.15
          const bw = colW * 0.7
          const isCurrent = u.month === thisMonth
          return (
            <g key={u.month}>
              <rect
                x={x} y={BAR_AREA_H - barH} width={bw} height={barH}
                rx={3}
                fill={isCurrent ? '#1d4ed8' : '#1e3a5f'}
                opacity={0.85}
              />
              {/* 금액 레이블 */}
              {totals[i] > 0 && (
                <text x={x + bw / 2} y={BAR_AREA_H - barH - 3} textAnchor="middle" fontSize={8} fill="#555">
                  {(totals[i] / 1000).toFixed(0)}K
                </text>
              )}
              {/* 월 레이블 */}
              <text x={x + bw / 2} y={H - 2} textAnchor="middle" fontSize={9} fill={isCurrent ? '#60a5fa' : '#444'}>
                {u.month.slice(5)}월
              </text>
            </g>
          )
        })}

        {/* 선형 그래프 */}
        {points.length > 1 && (
          <>
            {/* 영역 채우기 */}
            <polyline
              points={[
                `${points[0].x},${BAR_AREA_H}`,
                ...points.map(p => `${p.x},${p.y}`),
                `${points[points.length - 1].x},${BAR_AREA_H}`,
              ].join(' ')}
              fill="rgba(96,165,250,0.06)"
              stroke="none"
            />
            {/* 선 */}
            <polyline
              points={polyline}
              fill="none"
              stroke="#60a5fa"
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* 점 */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x} cy={p.y} r={sorted[i].month === thisMonth ? 4 : 2.5}
                fill={sorted[i].month === thisMonth ? '#60a5fa' : '#111118'}
                stroke="#60a5fa"
                strokeWidth={1.5}
              />
            ))}
          </>
        )}
      </svg>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#1e3a5f' }} />
          <span style={{ fontSize: 10, color: '#555' }}>월별 합계</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 16, height: 2, background: '#60a5fa', borderRadius: 1 }} />
          <span style={{ fontSize: 10, color: '#555' }}>추이선</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#1d4ed8' }} />
          <span style={{ fontSize: 10, color: '#60a5fa' }}>이번달</span>
        </div>
      </div>

      {/* 누적 합계 */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #1e1e28', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#555' }}>6개월 누적</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#fbbf24' }}>
          {totals.reduce((a, b) => a + b, 0).toLocaleString()}원
        </span>
      </div>
    </div>
  )
}
