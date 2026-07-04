'use client'

import { useState } from 'react'
import Link from 'next/link'

const CATEGORY_ICONS: Record<string, string> = {
  '점검': 'ti-search',
  '수리': 'ti-tool',
  '교체': 'ti-refresh',
  '청소': 'ti-ripple',
  '설치': 'ti-hammer',
  '기타': 'ti-pin',
}
const CATEGORY_COLORS: Record<string, string> = {
  '점검': '#34d399',
  '수리': '#60a5fa',
  '교체': '#f59e0b',
  '청소': '#a78bfa',
  '설치': '#fb923c',
  '기타': '#888',
}

interface Props {
  h: any
  houseId: string
  highlight?: string
  deleteAction: (formData: FormData) => Promise<void>
}

export default function HistoryCard({ h, houseId, highlight, deleteAction }: Props) {
  const [expanded, setExpanded] = useState(false)
  const icon = CATEGORY_ICONS[h.category] || 'ti-pin'
  const color = CATEGORY_COLORS[h.category] || '#888'
  const isHighlighted = highlight === h.id

  const hasDetail = h.description || h.contactCompany || h.company || h.contactName || h.contactPhone || h.inventory || h.estimateImageBase64 || h.contractImageBase64

  return (
    <div
      id={`history-${h.id}`}
      style={{
        background: isHighlighted ? '#0d1a2e' : 'var(--bg-card)',
        border: isHighlighted ? '1px solid #3b82f6' : '0.5px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'border 0.3s',
      }}
    >
      {/* 항상 보이는 헤더 */}
      <div
        style={{ padding: '14px 16px', display: 'flex', gap: 12, cursor: hasDetail ? 'pointer' : 'default' }}
        onClick={() => hasDetail && setExpanded(e => !e)}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`ti ${icon}`} style={{ fontSize: 20, color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</p>
            <p style={{ fontSize: 13, color: '#555', flexShrink: 0, marginLeft: 8 }}>
              {new Date(h.doneAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <span style={{ fontSize: 13, color: '#555' }}>
              {h.cost != null ? `${h.cost.toLocaleString()}원` : h.category}
            </span>
            {hasDetail && (
              <i className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 14, color: '#555' }} />
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <Link href={`/houses/${houseId}/history/${h.id}/edit`} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 20, padding: 4, textDecoration: 'none' }}>
            <i className="ti ti-pencil" />
          </Link>
          <form action={deleteAction}>
            <button type="submit" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 20, padding: 4 }}>
              <i className="ti ti-trash" />
            </button>
          </form>
        </div>
      </div>

      {/* 펼쳐지는 상세 정보 */}
      {expanded && hasDetail && (
        <div style={{ borderTop: '0.5px solid var(--border)', padding: '12px 16px 14px 64px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {h.description && (
            <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.5 }}>{h.description}</p>
          )}
          {(h.contactCompany || h.company || h.contactName || h.contactPhone) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(h.contactCompany || h.company) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-building" style={{ fontSize: 13, color: '#888' }} />
                  <span style={{ fontSize: 14, color: '#ccc' }}>{h.contactCompany || h.company}</span>
                </div>
              )}
              {h.contactName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-user" style={{ fontSize: 13, color: '#888' }} />
                  <span style={{ fontSize: 14, color: '#ccc' }}>{h.contactName}</span>
                </div>
              )}
              {h.contactPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-phone" style={{ fontSize: 13, color: '#888' }} />
                  <a href={`tel:${h.contactPhone}`} style={{ fontSize: 14, color: '#60a5fa', textDecoration: 'none' }}>{h.contactPhone}</a>
                </div>
              )}
            </div>
          )}
          {h.inventory && (
            <Link href={`/houses/${houseId}?tab=inventory&highlight=${h.inventory.id}`} style={{ fontSize: 14, color: '#60a5fa', background: '#0d1a2e', border: '0.5px solid #1d3a6e', borderRadius: 6, padding: '4px 10px', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <i className="ti ti-tool" style={{ fontSize: 13 }} />
              {h.inventory.name}
            </Link>
          )}
          {(h.estimateImageBase64 || h.contractImageBase64) && (
            <div style={{ display: 'flex', gap: 6 }}>
              {h.estimateImageBase64 && <div style={{ fontSize: 12, color: '#a78bfa', background: '#1a1040', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-file-invoice" style={{ fontSize: 13 }} />견적서</div>}
              {h.contractImageBase64 && <div style={{ fontSize: 12, color: '#34d399', background: '#0d1f14', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-file-text" style={{ fontSize: 13 }} />계약서</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
