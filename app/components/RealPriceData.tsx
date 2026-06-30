'use client'

import { useState, useEffect } from 'react'

interface Props {
  address: string
  houseType: string
  area: number | null
}

interface RealPriceResult {
  count: number
  avg: number
  min: number
  max: number
  median: number
  months: string[]
  lawdCd: string
  error?: string
}

function fmt(n: number) {
  const eok = Math.floor(n / 100000000)
  const man = Math.floor((n % 100000000) / 10000)
  if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만원`
  if (eok > 0) return `${eok}억원`
  return `${man.toLocaleString()}만원`
}

export default function RealPriceData({ address, houseType, area }: Props) {
  const [data, setData] = useState<RealPriceResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ address, houseType, area: String(area || 0) })
      const res = await fetch(`/api/realprice?${params}`)
      const json = await res.json()
      setData(json)
    } catch {
      setData({ error: '데이터를 불러오지 못했습니다.' } as RealPriceResult)
    }
    setLoading(false)
    setFetched(true)
  }

  useEffect(() => {}, [])

  if (!fetched && !loading) return (
    <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 16, padding: 20, marginTop: 16, textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: '#555', marginBottom: 14 }}>국토교통부 실거래가를 조회합니다</p>
      <button onClick={load} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
        <i className="ti ti-building-estate" style={{ fontSize: 16 }} />
        국토부 실거래가 조회
      </button>
    </div>
  )

  if (loading) return (
    <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 16, padding: 20, marginTop: 16, textAlign: 'center' }}>
      <p style={{ fontSize: 13, color: '#555' }}>실거래가 조회 중...</p>
    </div>
  )

  if (data?.error) return (
    <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 16, padding: 20, marginTop: 16 }}>
      <p style={{ fontSize: 12, color: '#f87171' }}>{data.error}</p>
      <button onClick={load} style={{ marginTop: 8, fontSize: 12, color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>다시 시도</button>
    </div>
  )

  if (!data) return null

  const monthLabel = data.months?.map(m => `${m.slice(0, 4)}.${m.slice(4)}`).join(', ')

  return (
    <div style={{ background: 'linear-gradient(135deg, #0d1a2e, #111828)', border: '0.5px solid #1e3a5f', borderRadius: 16, padding: 20, marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa' }}>📊 국토부 실거래가</p>
        <p style={{ fontSize: 10, color: '#444' }}>{monthLabel} · {data.count}건</p>
      </div>

      {/* 중간값 크게 */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>중간 거래가</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{fmt(data.median)}</p>
      </div>

      {/* 최저/평균/최고 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ background: '#0a0f1a', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>최저</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>{fmt(data.min)}</p>
        </div>
        <div style={{ background: '#0a0f1a', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>평균</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>{fmt(data.avg)}</p>
        </div>
        <div style={{ background: '#0a0f1a', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>최고</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#f87171' }}>{fmt(data.max)}</p>
        </div>
      </div>

      {area && (
        <p style={{ fontSize: 10, color: '#333', marginTop: 12, textAlign: 'center' }}>
          전용면적 {area}㎡ 유사 매물 기준 · 출처: 국토교통부
        </p>
      )}
    </div>
  )
}
