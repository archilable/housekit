'use client'

import { useState } from 'react'

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

export default function DoctorTab({ houseId }: { houseId: string }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<string>('image/jpeg')
  const [description, setDescription] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  void houseId

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaType(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)
      setImageBase64(dataUrl.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!imageBase64 && !description) {
      setError('사진 또는 설명을 입력해주세요.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType, description }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function renderResult(text: string) {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return <p key={i} style={{ fontSize: 14, fontWeight: 600, color: '#60a5fa', marginTop: 16, marginBottom: 4 }}>{line.replace('## ', '')}</p>
      }
      if (line.includes('숨고 검색') && lines[i + 1]) return null
      const sogooMatch = line.match(/^([^:]+)$/)
      if (lines[i - 1]?.includes('숨고 검색') && sogooMatch) {
        const keyword = line.trim()
        const url = `https://soomgo.com/search/pro?keyword=${encodeURIComponent(keyword)}`
        return (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', marginTop: 8, background: '#1d4ed8', color: '#fff', padding: '10px 16px', borderRadius: 10, fontSize: 13, textDecoration: 'none', wordBreak: 'keep-all' }}>
            숨고에서 "{keyword}" 전문가 찾기 →
          </a>
        )
      }
      if (!line.trim()) return <br key={i} />
      return <p key={i} style={{ fontSize: 13, color: '#ccc', lineHeight: 1.7, margin: '2px 0', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{line}</p>
    })
  }

  return (
    <div style={{ padding: '16px 16px', width: '100%', boxSizing: 'border-box' }}>
      {/* 헤더 */}
      <div style={{ background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <i className="ti ti-stethoscope" style={{ color: '#60a5fa', fontSize: 20 }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: '#60a5fa' }}>AI 하우스 닥터</span>
        </div>
        <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, margin: 0 }}>
          문제 부위 사진을 찍거나 증상을 설명하면 AI가 진단하고 수리 방법과 필요한 자재를 알려드려요.
        </p>
      </div>

      {/* 사진 */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 8, marginTop: 0 }}>사진 (선택)</p>
        {preview ? (
          <div style={{ position: 'relative', width: '100%' }}>
            <img src={preview} alt="업로드 사진" style={{ width: '100%', borderRadius: 12, maxHeight: 220, objectFit: 'cover', display: 'block' }} />
            <button onClick={() => { setPreview(null); setImageBase64(null) }}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f87171', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
              삭제
            </button>
          </div>
        ) : (
          <label style={{ display: 'block', width: '100%', background: '#1a1a24', border: '1px dashed #2a2a38', borderRadius: 12, padding: '24px 0', color: '#555', cursor: 'pointer', fontSize: 13, boxSizing: 'border-box', textAlign: 'center' }}>
            <i className="ti ti-camera" style={{ fontSize: 24, display: 'block', marginBottom: 6, color: '#444' }} />
            사진 촬영 또는 갤러리에서 선택
            <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          </label>
        )}
      </div>

      {/* 증상 설명 */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 8, marginTop: 0 }}>증상 설명</p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="예: 화장실 천장에서 물이 새요. 갈색 얼룩이 생겼어요."
          style={{ ...inputStyle, resize: 'none' }}
        />
      </div>

      {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12, wordBreak: 'break-all' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        style={{ width: '100%', background: loading ? '#1a2a4a' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', boxSizing: 'border-box' }}>
        {loading ? 'AI 진단 중...' : '🏥 AI 진단 시작'}
      </button>

      {result && (
        <div style={{ marginTop: 24, background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 16, padding: 16, wordBreak: 'keep-all', overflowWrap: 'break-word', overflow: 'hidden' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#34d399', marginBottom: 12, marginTop: 0 }}>✅ 진단 완료</p>
          {renderResult(result)}
        </div>
      )}
    </div>
  )
}
