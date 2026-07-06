'use client'

import { useState, useEffect, useRef } from 'react'

type FloorPlan = {
  id: string
  name: string
  url: string
  fileType: string
  fileSize: number
  createdAt: string
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export default function FloorPlanSection({ houseId }: { houseId: string }) {
  const [plans, setPlans] = useState<FloorPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<FloorPlan | null>(null)
  const [uploadName, setUploadName] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetch(`/api/houses/${houseId}/floorplans`)
      .then(r => r.json())
      .then(data => { setPlans(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [houseId])

  async function handleUpload() {
    if (!selectedFile || !uploadName.trim()) return
    setError('')
    setUploading(true)
    const fd = new FormData()
    fd.append('file', selectedFile)
    fd.append('houseId', houseId)
    fd.append('name', uploadName.trim())
    const res = await fetch('/api/floorplans', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (!res.ok) { setError(data.error || '업로드 실패'); return }
    setPlans(prev => [...prev, data])
    setShowUpload(false)
    setSelectedFile(null)
    setUploadName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(id: string) {
    if (!confirm('이 도면을 삭제할까요?')) return
    await fetch(`/api/floorplans/${id}`, { method: 'DELETE' })
    setPlans(prev => prev.filter(p => p.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>도면 · 설계도</p>
        <button
          onClick={() => setShowUpload(v => !v)}
          style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          + 업로드
        </button>
      </div>

      {/* 업로드 패널 */}
      {showUpload && (
        <div style={{ background: '#111828', border: '0.5px solid #2a2a38', borderRadius: 16, padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#888' }}>PDF, JPG, PNG · 최대 20MB</p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={e => {
              const f = e.target.files?.[0] ?? null
              setSelectedFile(f)
              if (f && !uploadName) setUploadName(f.name.replace(/\.[^.]+$/, ''))
            }}
            style={{ color: '#aaa', fontSize: 14 }}
          />
          <input
            type="text"
            value={uploadName}
            onChange={e => setUploadName(e.target.value)}
            placeholder="도면 이름 (예: 1층 도면, 전기 배선도)"
            style={{ background: '#1a1a24', border: '0.5px solid #2a2a38', borderRadius: 10, padding: '10px 14px', fontSize: 15, color: '#fff', fontFamily: 'inherit', outline: 'none' }}
          />
          {error && <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !uploadName.trim() || uploading}
            style={{ background: uploading || !selectedFile || !uploadName.trim() ? '#1e1e28' : '#1d4ed8', color: uploading || !selectedFile || !uploadName.trim() ? '#555' : '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 15, fontWeight: 600, cursor: uploading ? 'wait' : 'pointer', fontFamily: 'inherit' }}
          >
            {uploading ? '업로드 중...' : '업로드'}
          </button>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <p style={{ color: '#444', fontSize: 14 }}>불러오는 중...</p>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#444' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📐</div>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 6, color: '#555' }}>도면이 없어요</p>
          <p style={{ fontSize: 14, color: '#444' }}>PDF나 이미지를 업로드해 보세요</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plans.map(plan => (
            <div
              key={plan.id}
              style={{ background: '#111828', border: `0.5px solid ${selected?.id === plan.id ? '#60a5fa' : '#1e1e28'}`, borderRadius: 16, padding: '14px 16px', cursor: 'pointer' }}
              onClick={() => setSelected(selected?.id === plan.id ? null : plan)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: plan.fileType === 'pdf' ? 'rgba(248,113,113,0.1)' : 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {plan.fileType === 'pdf' ? '📄' : '🖼️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.name}</p>
                  <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{plan.fileType.toUpperCase()} · {formatSize(plan.fileSize)}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <a
                    href={plan.url}
                    download
                    onClick={e => e.stopPropagation()}
                    style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  >
                    ↓
                  </a>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(plan.id) }}
                    style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 뷰어 */}
              {selected?.id === plan.id && (
                <div style={{ marginTop: 14, borderTop: '0.5px solid #1e1e28', paddingTop: 14 }}>
                  {plan.fileType === 'pdf' ? (
                    <div>
                      <iframe
                        src={plan.url}
                        style={{ width: '100%', height: 480, border: 'none', borderRadius: 8, background: '#fff' }}
                        title={plan.name}
                      />
                      <a
                        href={plan.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'block', textAlign: 'center', marginTop: 10, color: '#60a5fa', fontSize: 14 }}
                      >
                        새 탭에서 열기 →
                      </a>
                    </div>
                  ) : (
                    <div style={{ overflow: 'auto', touchAction: 'pinch-zoom', borderRadius: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={plan.url}
                        alt={plan.name}
                        style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
