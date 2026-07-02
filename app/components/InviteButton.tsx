'use client'

import { useState } from 'react'

export default function InviteButton({ houseId }: { houseId: string }) {
  const [link, setLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ houseId }),
    })
    const data = await res.json()
    const url = `${window.location.origin}/invite/${data.token}`
    setLink(url)
    setLoading(false)
  }

  async function copy() {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={generate}
        disabled={loading}
        style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: 18, cursor: 'pointer', padding: 0 }}
        title="초대 링크 생성"
      >
        <i className="ti ti-user-plus" aria-hidden="true" />
      </button>

      {link && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24,
        }} onClick={() => setLink(null)}>
          <div style={{
            background: '#111828', border: '0.5px solid #1e3a5f', borderRadius: 20,
            padding: 24, width: '100%', maxWidth: 340,
          }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>초대 링크 생성됨 🎉</p>
            <p style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>링크를 공유하면 상대방이 로그인 후 이 집을 볼 수 있어요</p>
            <div style={{ background: '#0a0a0f', borderRadius: 10, padding: '10px 14px', marginBottom: 12, wordBreak: 'break-all', fontSize: 11, color: '#60a5fa' }}>
              {link}
            </div>
            <button onClick={copy} style={{
              width: '100%', background: copied ? '#1a3d28' : '#1d4ed8',
              color: copied ? '#34d399' : '#fff', border: 'none', borderRadius: 12,
              padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              {copied ? '복사됨 ✓' : '링크 복사하기'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
