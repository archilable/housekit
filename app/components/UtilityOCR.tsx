'use client'
import { useRef, useState } from 'react'

interface UtilityData {
  electric?: number
  water?: number
  gas?: number
  telecom?: number
  month?: string
}

interface Props {
  onResult: (data: UtilityData) => void
}

function formatAmount(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

const LABELS: Record<string, string> = {
  electric: '⚡ 전기세',
  water: '💧 수도세',
  gas: '🔥 가스비',
  telecom: '📱 통신비',
}

export default function UtilityOCR({ onResult }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<UtilityData & { memo?: string } | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    setPreview(null)

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

        setPreview(data)
        setLoading(false)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했어요')
      setLoading(false)
    }
  }

  function handleConfirm() {
    if (!preview) return
    onResult({
      electric: preview.electric ?? undefined,
      water: preview.water ?? undefined,
      gas: preview.gas ?? undefined,
      telecom: preview.telecom ?? undefined,
      month: preview.month ?? undefined,
    })
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const hasAny = preview && (preview.electric || preview.water || preview.gas || preview.telecom)

  return (
    <div style={{ marginBottom: 20 }}>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
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
          boxSizing: 'border-box', fontFamily: 'inherit',
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
            AI가 고지서 읽는 중...
          </>
        ) : (
          <>
            <i className="ti ti-camera" style={{ fontSize: 22 }} />
            고지서 · 문자 · 계좌내역 사진으로 자동 입력
          </>
        )}
      </button>

      {/* 확인 단계 */}
      {preview && (
        <div style={{ marginTop: 12, background: '#0d1520', border: '0.5px solid #1e3a5f', borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 13, color: '#60a5fa', fontWeight: 600, marginBottom: 12 }}>
            📋 인식 결과 확인
          </p>
          {preview.memo && (
            <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>{preview.memo}</p>
          )}

          {hasAny ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {(['electric', 'water', 'gas', 'telecom'] as const).map(key => {
                const val = preview[key]
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: val ? '#ccc' : '#333' }}>{LABELS[key]}</span>
                    <span style={{ fontSize: 14, fontWeight: val ? 600 : 400, color: val ? '#fff' : '#333' }}>
                      {val ? formatAmount(val) : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: '#f87171', marginBottom: 14 }}>공과금 금액을 찾지 못했어요. 다시 촬영해 주세요.</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = '' }}
              style={{ background: '#1a1a24', border: '0.5px solid #2a2a38', borderRadius: 10, padding: '11px 0', fontSize: 14, color: '#555', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
            >
              다시 촬영
            </button>
            {hasAny && (
              <button
                type="button"
                onClick={handleConfirm}
                style={{ background: '#1d4ed8', border: 'none', borderRadius: 10, padding: '11px 0', fontSize: 14, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
              >
                입력 적용
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p style={{ marginTop: 8, fontSize: 14, color: '#f87171', textAlign: 'center' }}>{error}</p>
      )}
    </div>
  )
}
