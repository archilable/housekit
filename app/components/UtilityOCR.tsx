'use client'
import { useRef, useState } from 'react'

interface Props {
  onResult: (data: { electric?: number; water?: number; gas?: number; telecom?: number; month?: string }) => void
}

export default function UtilityOCR({ onResult }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [memo, setMemo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    setMemo(null)

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const dataUrl = reader.result as string
        const base64 = dataUrl.split(',')[1]
        const mediaType = file.type || 'image/jpeg'

        const res = await fetch('/api/ocr-utility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        onResult({
          electric: data.electric ?? undefined,
          water: data.water ?? undefined,
          gas: data.gas ?? undefined,
          telecom: data.telecom ?? undefined,
          month: data.month ?? undefined,
        })
        if (data.memo) setMemo(data.memo)
        setLoading(false)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했어요')
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        style={{
          width: '100%', border: loading ? '0.5px solid #1a3d28' : '0.5px dashed #2a2a38',
          borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#0d1f14' : '#0a0a0f',
          color: loading ? '#34d399' : '#888',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxSizing: 'border-box',
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
            AI가 금액 읽는 중...
          </>
        ) : (
          <>
            <i className="ti ti-camera" style={{ fontSize: 22 }} />
            고지서 · 계좌내역 사진으로 자동 입력
          </>
        )}
      </button>

      {memo && (
        <div style={{ marginTop: 10, background: '#0d1f14', border: '0.5px solid #1a3d28', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#34d399' }}>
          ✅ {memo}
        </div>
      )}
      {error && (
        <p style={{ marginTop: 8, fontSize: 14, color: '#f87171', textAlign: 'center' }}>{error}</p>
      )}
    </div>
  )
}
