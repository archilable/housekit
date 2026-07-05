'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type DoctorHistory = {
  id: string
  houseId: string
  description: string | null
  imageBase64: string | null
  result: string
  resolved: boolean
  resolvedAt: Date | string | null
  createdAt: Date | string
}

function extractKeyword(text: string): string {
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('숨고 검색') || lines[i].includes('검색 키워드')) {
      const next = lines[i + 1]?.trim()
      if (next) return next.replace(/^[-*\s]+/, '').trim()
    }
  }
  return text.split('\n').find(l => l.trim() && !l.startsWith('#'))?.slice(0, 20) || '수리'
}

function extractMaterials(text: string): string[] {
  const lines = text.split('\n')
  const materials: string[] = []
  let inMaterials = false
  for (const line of lines) {
    if (line.includes('필요한 자재') || line.includes('자재')) inMaterials = true
    else if (line.startsWith('## ')) inMaterials = false
    if (inMaterials && line.trim().startsWith('-')) {
      const mat = line.replace(/^-\s*/, '').split('(')[0].trim()
      if (mat) materials.push(mat)
    }
  }
  return materials
}

function ResolveModal({ history, onClose }: { history: DoctorHistory; onClose: () => void }) {
  const router = useRouter()
  const keyword = extractKeyword(history.result)

  function goToHistory() {
    const title = encodeURIComponent(history.description || keyword)
    router.push(`/houses/${history.houseId}/history/new?title=${title}&category=수리`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: '#111118', borderRadius: '20px 20px 0 0', padding: '24px 20px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)', width: '100%', maxWidth: 480, marginBottom: 60 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 42 }}>🎉</span>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 8, marginBottom: 4 }}>해결 완료!</p>
          <p style={{ fontSize: 15, color: '#666', margin: 0 }}>수리 이력에 기록해두면 나중에 참고할 수 있어요</p>
        </div>
        <button onClick={goToHistory}
          style={{ width: '100%', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 17, fontWeight: 500, cursor: 'pointer', marginBottom: 10 }}>
          📋 수리 이력에 추가하기
        </button>
        <button onClick={onClose}
          style={{ width: '100%', background: '#1a1a24', color: '#888', border: 'none', borderRadius: 14, padding: '15px', fontSize: 16, cursor: 'pointer' }}>
          괜찮아요
        </button>
      </div>
    </div>
  )
}

function HistoryCard({ h }: { h: DoctorHistory }) {
  const [resolved, setResolved] = useState(h.resolved)
  const [resolvedAt, setResolvedAt] = useState<string | null>(h.resolvedAt ? new Date(h.resolvedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)

  async function handleDelete() {
    if (!confirm('이 진단 이력을 삭제할까요?')) return
    setLoading(true)
    await fetch(`/api/doctor/${h.id}`, { method: 'DELETE' })
    setDeleted(true)
  }

  if (deleted) return null

  const lines = h.result.split('\n').filter(l => l.trim() && !l.startsWith('##'))
  const summary = lines[0]?.slice(0, 60) || '진단 결과'
  const severity = h.result.match(/\[?(낮음|보통|높음|긴급)\]?/)?.[1]
  const severityColor: Record<string, string> = { 낮음: '#34d399', 보통: '#fbbf24', 높음: '#f97316', 긴급: '#f87171' }
  const dateStr = new Date(h.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
  const keyword = extractKeyword(h.result)
  const materials = extractMaterials(h.result)

  async function handleResolve() {
    setLoading(true)
    const res = await fetch(`/api/doctor/${h.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolved: true }) })
    const data = await res.json()
    setResolved(true)
    setResolvedAt(new Date(data.resolvedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }))
    setLoading(false)
    setShowModal(true)
  }

  async function handleUnresolve() {
    setLoading(true)
    await fetch(`/api/doctor/${h.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolved: false }) })
    setResolved(false)
    setResolvedAt(null)
    setLoading(false)
  }

  return (
    <>
      {showModal && <ResolveModal history={h} onClose={() => setShowModal(false)} />}
      <details
        style={{
          background: resolved ? '#0d0d12' : '#111118',
          border: `0.5px solid ${resolved ? '#1a2a1a' : '#1e1e28'}`,
          borderRadius: 14,
          overflow: 'hidden',
          opacity: resolved ? 0.6 : 1,
          transition: 'opacity 0.3s',
        }}>
        <summary style={{ padding: '14px 16px', cursor: 'pointer', listStyle: 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              {resolved ? (
                <span style={{ fontSize: 12, color: '#34d399', background: '#34d39922', padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>✅ 해결됨 {resolvedAt && `· ${resolvedAt}`}</span>
              ) : severity ? (
                <span style={{ fontSize: 12, color: severityColor[severity] || '#888', background: (severityColor[severity] || '#888') + '22', padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>{severity}</span>
              ) : null}
              <span style={{ fontSize: 13, color: '#555' }}>{dateStr}</span>
            </div>
            <p style={{ fontSize: 15, color: resolved ? '#555' : '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {h.description || summary}
            </p>
          </div>
          <i className="ti ti-chevron-down" style={{ fontSize: 18, color: '#444', flexShrink: 0, marginTop: 2 }} />
        </summary>

        {/* 삭제 버튼 — summary 밖에 배치 (iOS Safari 호환) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px 4px' }}>
          <button onClick={handleDelete} disabled={loading}
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px 8px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
            <i className="ti ti-trash" style={{ fontSize: 16 }} />
            삭제
          </button>
        </div>

        <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid #1e1e28' }}>
          {/* 진단 사진 */}
          {h.imageBase64 && (
            <img src={`data:image/jpeg;base64,${h.imageBase64}`} alt="진단 사진"
              style={{ width: '100%', borderRadius: 10, maxHeight: 200, objectFit: 'cover', display: 'block', marginTop: 12, marginBottom: 8 }} />
          )}

          {/* 진단 결과 텍스트 */}
          <div style={{ marginTop: 12, marginBottom: 16 }}>
            {h.result.split('\n').map((line, i) => {
              if (line.includes('숨고') || line.includes('soomgo') || line.includes('전문가 검색') || line.includes('검색어')) return null
              if (line.startsWith('## ')) return <p key={i} style={{ fontSize: 15, fontWeight: 600, color: '#60a5fa', marginTop: 12, marginBottom: 4 }}>{line.replace('## ', '')}</p>
              if (!line.trim()) return <br key={i} />
              return <p key={i} style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6, margin: '2px 0', wordBreak: 'keep-all' }}>{line}</p>
            })}
          </div>

          {/* 쿠팡 자재 링크 */}
          {materials.length > 0 && (
            <div style={{ background: '#1a0f00', border: '0.5px solid #f9731622', borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: '#f97316', marginBottom: 8, fontWeight: 500 }}>🛒 쿠팡에서 자재 바로 구매</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {materials.map((mat, i) => (
                  <a key={i} href={`https://www.coupang.com/np/search?q=${encodeURIComponent(mat)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', border: '0.5px solid #f9731633', borderRadius: 8, padding: '8px 12px', textDecoration: 'none' }}>
                    <span style={{ fontSize: 14, color: '#ddd' }}>{mat}</span>
                    <span style={{ fontSize: 13, color: '#f97316', fontWeight: 600, flexShrink: 0 }}>쿠팡 →</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: resolved ? 0 : 10 }}>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(keyword + ' DIY 수리 방법')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#111828', border: '0.5px solid #1e3a5f', borderRadius: 12, padding: '12px 8px', textDecoration: 'none' }}>
              <span style={{ fontSize: 22 }}>🔧</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>DIY 수리</span>
              <span style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>유튜브 영상으로 직접 수리</span>
            </a>
            <a href={`https://search.naver.com/search.naver?query=${encodeURIComponent(keyword + ' 전문가')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 12, padding: '12px 8px', textDecoration: 'none' }}>
              <span style={{ fontSize: 22 }}>👷</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#60a5fa' }}>전문가 찾기</span>
              <span style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>네이버에서 전문가 검색</span>
            </a>
          </div>

          {/* 해결 완료 / 해결 취소 버튼 */}
          {resolved ? (
            <button onClick={handleUnresolve} disabled={loading}
              style={{ width: '100%', background: '#1a1a24', border: '0.5px solid #444', color: '#888', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 2 }}>
              {loading ? '처리 중...' : '↩ 해결 취소'}
            </button>
          ) : (
            <button onClick={handleResolve} disabled={loading}
              style={{ width: '100%', background: '#0a2010', border: '0.5px solid #34d39944', color: '#34d399', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 2 }}>
              {loading ? '처리 중...' : '✅ 문제 해결 완료'}
            </button>
          )}
        </div>
      </details>
    </>
  )
}

export default function DoctorHistoryList({ histories }: { histories: DoctorHistory[] }) {
  if (histories.length === 0) return null

  const unresolved = histories.filter(h => !h.resolved)
  const resolved = histories.filter(h => h.resolved)
  const sorted = [...unresolved, ...resolved]

  return (
    <div style={{ padding: '0 16px', marginTop: 8 }}>
      <p style={{ fontSize: 13, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>진단 이력</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map(h => <HistoryCard key={h.id} h={h} />)}
      </div>
    </div>
  )
}
