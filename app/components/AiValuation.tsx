'use client'

import { useState } from 'react'

interface Props {
  address: string
  houseType: string
  buildYear: number | null
  area: number | null
}

export default function AiValuation({ address, houseType, buildYear, area }: Props) {
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [result, setResult] = useState<{
    minPrice: number
    maxPrice: number
    midPrice: number
    basis: string
    confidence: string
    note: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fmt = (n: number) => {
    if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`
    if (n >= 10000) return `${Math.round(n / 10000).toLocaleString()}만원`
    return n.toLocaleString() + '원'
  }

  const confidenceColor: Record<string, string> = {
    높음: '#34d399', 보통: '#fbbf24', 낮음: '#f87171',
  }

  async function estimate() {
    setLoading(true)
    setError(null)
    setResult(null)

    const msgs = ['🏘️ 실거래 데이터 수집 중...', '🤖 AI 시세 분석 중...', '📊 추정가 계산 중...']
    let mi = 0
    setLoadingMsg(msgs[0])
    const timer = setInterval(() => {
      mi = (mi + 1) % msgs.length
      setLoadingMsg(msgs[mi])
    }, 2500)

    try {
      const res = await fetch('/api/valuation-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, houseType, buildYear, area }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했어요')
    } finally {
      clearInterval(timer)
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {/* AI 추정 버튼 */}
      {!result && (
        <button
          onClick={estimate}
          disabled={loading}
          style={{
            width: '100%', border: 'none', borderRadius: 14,
            padding: '15px', fontSize: 16, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#1a2a1a' : 'linear-gradient(135deg, #14532d, #166534)',
            color: loading ? '#555' : '#4ade80',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxSizing: 'border-box',
          }}
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
              {loadingMsg}
            </>
          ) : (
            <>
              <i className="ti ti-sparkles" style={{ fontSize: 19 }} />
              AI 실거래 시세 추정
            </>
          )}
        </button>
      )}

      {error && (
        <p style={{ color: '#f87171', fontSize: 14, textAlign: 'center', marginTop: 8 }}>{error}</p>
      )}

      {result && (
        <div style={{ background: 'linear-gradient(135deg, #052e16 0%, #0f2818 100%)', border: '0.5px solid #166534', borderRadius: 20, padding: 20 }}>
          {/* 헤더 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-sparkles" style={{ fontSize: 17, color: '#4ade80' }} />
              <span style={{ fontSize: 14, color: '#4ade80', fontWeight: 500 }}>AI 시세 추정</span>
            </div>
            <span style={{
              fontSize: 12, padding: '2px 10px', borderRadius: 20,
              color: confidenceColor[result.confidence] ?? '#888',
              background: (confidenceColor[result.confidence] ?? '#888') + '22',
              border: `0.5px solid ${(confidenceColor[result.confidence] ?? '#888')}44`,
            }}>
              신뢰도 {result.confidence}
            </span>
          </div>

          {/* 추정가 */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>추정 시세 범위</p>
            <p style={{ fontSize: 15, color: '#888', marginBottom: 4 }}>
              {fmt(result.minPrice)} ~ {fmt(result.maxPrice)}
            </p>
            <p style={{ fontSize: 37, fontWeight: 700, color: '#4ade80', letterSpacing: -1 }}>
              {fmt(result.midPrice)}
            </p>
            <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>중간 추정가</p>
          </div>

          {/* 범위 바 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ height: 6, background: '#0a0a0f', borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
                background: 'linear-gradient(90deg, #166534, #4ade80, #166534)',
                borderRadius: 10,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: '#555' }}>최저 {fmt(result.minPrice)}</span>
              <span style={{ fontSize: 12, color: '#555' }}>최고 {fmt(result.maxPrice)}</span>
            </div>
          </div>

          {/* 추정 근거 */}
          <div style={{ background: '#0a0a0f', borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: '#4ade80', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>추정 근거</p>
            <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7 }}>{result.basis}</p>
          </div>

          <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>⚠️ {result.note}</p>

          {/* 다시 추정 버튼 */}
          <button
            onClick={estimate}
            style={{ marginTop: 14, width: '100%', background: 'none', border: '0.5px solid #166534', borderRadius: 10, padding: '10px', fontSize: 14, color: '#4ade80', cursor: 'pointer', boxSizing: 'border-box' }}
          >
            다시 추정하기
          </button>
        </div>
      )}
    </div>
  )
}
