'use client'

import { useState } from 'react'
import Link from 'next/link'

function ImageModal({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 600, marginBottom: 12 }}>
        <span style={{ color: '#fff', fontSize: 16, fontWeight: 500 }}>{label}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 28, cursor: 'pointer', padding: 4 }}>
          <i className="ti ti-x" />
        </button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={label}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12 }}
      />
    </div>
  )
}

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
  const [modalImage, setModalImage] = useState<{ src: string; label: string } | null>(null)
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
            <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
              {h.estimateImageBase64 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/jpeg;base64,${h.estimateImageBase64}`}
                    alt="견적서"
                    onClick={() => setModalImage({ src: `data:image/jpeg;base64,${h.estimateImageBase64}`, label: '견적서' })}
                    style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '1px solid #2a1a5e' }}
                  />
                  <span style={{ fontSize: 12, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <i className="ti ti-file-invoice" style={{ fontSize: 12 }} />견적서
                  </span>
                </div>
              )}
              {h.contractImageBase64 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/jpeg;base64,${h.contractImageBase64}`}
                    alt="계약서"
                    onClick={() => setModalImage({ src: `data:image/jpeg;base64,${h.contractImageBase64}`, label: '계약서' })}
                    style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '1px solid #0d3020' }}
                  />
                  <span style={{ fontSize: 12, color: '#34d399', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <i className="ti ti-file-text" style={{ fontSize: 12 }} />계약서
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {modalImage && (
        <ImageModal src={modalImage.src} label={modalImage.label} onClose={() => setModalImage(null)} />
      )}
    </div>
  )
}
