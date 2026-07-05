'use client'

import { useState } from 'react'
import TabLink from './TabLink'

const PREVIEW = 3

export default function RecentHistoryToggle({ historyData, houseId }: { historyData: any[]; houseId: string }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? historyData : historyData.slice(0, PREVIEW)
  const dotColors: Record<string, string> = { 수리: '#60a5fa', 교체: '#a78bfa', 점검: '#34d399', 청소: '#fbbf24', 기타: '#888' }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>최근 이력</p>
        {historyData.length > PREVIEW && (
          <button onClick={() => setExpanded(v => !v)} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            {expanded ? '접기' : `+${historyData.length - PREVIEW}건 더 보기`}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {visible.map((h, idx) => (
          <TabLink key={h.id} houseId={houseId} tab="history" highlight={h.id} style={{ display: 'flex', gap: 12, paddingBottom: idx < visible.length - 1 ? 16 : 0, position: 'relative', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColors[h.category] || '#888', flexShrink: 0, marginTop: 4 }} />
              {idx < visible.length - 1 && <div style={{ width: 1, flex: 1, background: '#1e1e28', marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 15, fontWeight: 500 }}>{h.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <p style={{ fontSize: 13, color: '#555' }}>{new Date(h.doneAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <i className="ti ti-chevron-right" style={{ fontSize: 14, color: '#333' }} />
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#555', marginTop: 1 }}>{h.company && `${h.company} · `}{h.cost != null ? `${h.cost.toLocaleString()}원` : h.category}</p>
            </div>
          </TabLink>
        ))}
      </div>
    </>
  )
}
