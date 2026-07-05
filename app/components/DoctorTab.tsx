'use client'

import { useState, useRef } from 'react'

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 17, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

type DiagnosedEntry = { id: string; houseId: string; description: string | null; imageBase64: string | null; result: string; resolved: boolean; resolvedAt: null; createdAt: string }

export default function DoctorTab({ houseId, onDiagnosed }: { houseId: string; onDiagnosed?: (entry: DiagnosedEntry) => void }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<string>('image/jpeg')
  const [description, setDescription] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const submitting = useRef(false)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      const img = new Image()
      img.onload = () => {
        const MAX = 1280
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const jpeg = canvas.toDataURL('image/jpeg', 0.8)
        setPreview(jpeg)
        setMediaType('image/jpeg')
        setImageBase64(jpeg.split(',')[1])
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (submitting.current) return
    if (!imageBase64 && !description) {
      setError('사진 또는 설명을 입력해주세요.')
      return
    }
    submitting.current = true
    setLoading(true)
    setError(null)
    setResult(null)

    const msgs = imageBase64
      ? ['📸 이미지 분석 중...', '🔍 문제 파악 중...', '💊 진단서 작성 중...']
      : ['🔍 문제 파악 중...', '💊 진단서 작성 중...']
    let mi = 0
    setLoadingMsg(msgs[0])
    const timer = setInterval(() => {
      mi = (mi + 1) % msgs.length
      setLoadingMsg(msgs[mi])
    }, 2000)

    try {
      const res = await fetch('/api/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType, description, houseId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
      onDiagnosed?.({
        id: data.id || `tmp-${Date.now()}`,
        houseId,
        description: description || null,
        imageBase64: imageBase64 || null,
        result: data.result,
        resolved: false,
        resolvedAt: null,
        createdAt: new Date().toISOString(),
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally {
      clearInterval(timer)
      setLoading(false)
      submitting.current = false
    }
  }

  // 결과에서 숨고 키워드 여러 개 추출
  function extractSoomgoKeywords(text: string): string[] {
    const lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('숨고 검색') && lines[i + 1]) {
        return lines[i + 1].trim()
          .replace(/^["']|["']$/g, '')
          .split(/[,，]/)
          .map(k => k.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean)
      }
    }
    return description ? [description] : ['수리']
  }

  // 결과에서 자재 목록 추출
  function extractMaterials(text: string): string[] {
    const lines = text.split('\n')
    const materials: string[] = []
    let inMaterials = false
    for (const line of lines) {
      if (line.includes('필요한 자재')) { inMaterials = true; continue }
      if (inMaterials && line.startsWith('##')) break
      if (inMaterials && line.trim().startsWith('-')) {
        const mat = line.replace(/^-\s*/, '').split('(')[0].trim()
        if (mat) materials.push(mat)
      }
    }
    return materials
  }

  function renderResult(text: string) {
    const lines = text.split('\n')
    let inSoomgoSection = false
    return lines.map((line, i) => {
      // 숨고 섹션 진입 감지 (헤더 포함 완전히 숨김)
      if (line.includes('숨고 검색') || line.includes('🔗')) { inSoomgoSection = true; return null }
      if (inSoomgoSection) {
        if (line.startsWith('## ')) inSoomgoSection = false // 다음 섹션 시작
        else return null
      }
      if (line.startsWith('## ')) {
        return <p key={i} style={{ fontSize: 16, fontWeight: 600, color: '#60a5fa', marginTop: 16, marginBottom: 4 }}>{line.replace('## ', '')}</p>
      }
      // 자재 항목에 쿠팡 링크 추가
      if (line.trim().startsWith('-') && lines[i - 2]?.includes('필요한 자재') ||
          line.trim().startsWith('-') && lines[i - 1]?.includes('필요한 자재') ||
          (lines.slice(0, i).reverse().find(l => l.startsWith('##'))?.includes('필요한 자재'))) {
        const mat = line.replace(/^-\s*/, '').trim()
        const matName = mat.split('(')[0].trim()
        if (matName && line.trim().startsWith('-')) {
          const coupangUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent(matName)}`
          return (
            <a key={i} href={coupangUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a2e', border: '0.5px solid #2a2a38', borderRadius: 8, padding: '8px 12px', marginTop: 6, textDecoration: 'none' }}>
              <span style={{ fontSize: 15, color: '#ccc' }}>🛒 {mat}</span>
              <span style={{ fontSize: 13, color: '#f97316', fontWeight: 500, flexShrink: 0, marginLeft: 8 }}>쿠팡 →</span>
            </a>
          )
        }
      }
      if (!line.trim()) return <br key={i} />
      return <p key={i} style={{ fontSize: 15, color: '#ccc', lineHeight: 1.7, margin: '2px 0', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{line}</p>
    })
  }

  const soomgoKeywords = result ? extractSoomgoKeywords(result) : []
  const soomgoKeyword = soomgoKeywords[0] || description || '수리'
  const materials = result ? extractMaterials(result) : []

  function openSoomgo(keyword: string) {
    const webUrl = `https://soomgo.com/requests/search?keyword=${encodeURIComponent(keyword)}`
    const appUrl = `soomgo://search?keyword=${encodeURIComponent(keyword)}`

    let appOpened = false
    const onHide = () => { appOpened = true }
    document.addEventListener('visibilitychange', onHide)

    window.location.href = appUrl

    setTimeout(() => {
      document.removeEventListener('visibilitychange', onHide)
      if (!appOpened) window.open(webUrl, '_blank')
    }, 1500)
  }

  return (
    <div style={{ padding: '16px 16px', width: '100%', boxSizing: 'border-box' }}>
      {/* 헤더 */}
      <div style={{ background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <i className="ti ti-stethoscope" style={{ color: '#60a5fa', fontSize: 22 }} />
          <span style={{ fontSize: 16, fontWeight: 500, color: '#60a5fa' }}>AI 하우스 닥터</span>
        </div>
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, margin: 0 }}>
          문제 부위 사진을 찍거나 증상을 설명하면 AI가 진단하고 수리 방법과 필요한 자재를 알려드려요.
        </p>
      </div>

      {/* 사진 */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 8, marginTop: 0 }}>사진 (선택)</p>
        {preview ? (
          <div style={{ position: 'relative', width: '100%' }}>
            <img src={preview} alt="업로드 사진" style={{ width: '100%', borderRadius: 12, maxHeight: 220, objectFit: 'cover', display: 'block' }} />
            <button onClick={() => { setPreview(null); setImageBase64(null) }}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f87171', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontSize: 14 }}>
              삭제
            </button>
          </div>
        ) : (
          <label style={{ display: 'block', width: '100%', background: '#1a1a24', border: '1px dashed #2a2a38', borderRadius: 12, padding: '24px 0', color: '#555', cursor: 'pointer', fontSize: 15, boxSizing: 'border-box', textAlign: 'center' }}>
            <i className="ti ti-camera" style={{ fontSize: 26, display: 'block', marginBottom: 6, color: '#444' }} />
            사진 촬영 또는 갤러리에서 선택
            <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          </label>
        )}
      </div>

      {/* 증상 설명 */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 8, marginTop: 0 }}>증상 설명</p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="예: 화장실 천장에서 물이 새요. 갈색 얼룩이 생겼어요."
          style={{ ...inputStyle, resize: 'none' }}
        />
      </div>

      {error && <p style={{ color: '#f87171', fontSize: 15, marginBottom: 12, wordBreak: 'break-all' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        style={{ width: '100%', background: loading ? '#1a2a4a' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 17, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', boxSizing: 'border-box' }}>
        {loading ? loadingMsg : '🏥 AI 진단 시작'}
      </button>

      {result && (
        <div style={{ marginTop: 24, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 13, color: '#34d399', margin: 0 }}>✅ 이력에 저장됐어요</p>
            <button onClick={() => { setResult(null); setPreview(null); setImageBase64(null); setDescription('') }}
              style={{ background: '#1a1a24', border: '0.5px solid #2a2a38', color: '#888', borderRadius: 20, padding: '5px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              다시 진단하기
            </button>
          </div>
          {/* 진단 결과 */}
          <div style={{ background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 16, padding: 16, marginBottom: 12, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#34d399', marginBottom: 12, marginTop: 0 }}>✅ 진단 완료</p>
            {renderResult(result)}
          </div>

          {/* 자재 쿠팡 검색 버튼 (추가로) */}
          {materials.length > 0 && (
            <div style={{ background: '#1a0f00', border: '0.5px solid #f9731622', borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <p style={{ fontSize: 14, color: '#f97316', marginBottom: 10, fontWeight: 500 }}>🛒 쿠팡에서 자재 바로 구매</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {materials.map((mat, i) => (
                  <a key={i} href={`https://www.coupang.com/np/search?q=${encodeURIComponent(mat)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', border: '0.5px solid #f9731633', borderRadius: 10, padding: '10px 14px', textDecoration: 'none' }}>
                    <span style={{ fontSize: 15, color: '#ddd' }}>{mat}</span>
                    <span style={{ fontSize: 14, color: '#f97316', fontWeight: 600, flexShrink: 0 }}>쿠팡 검색 →</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 숨고 키워드 태그 */}
          {soomgoKeywords.length > 0 && (
            <div style={{ background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <p style={{ fontSize: 14, color: '#60a5fa', fontWeight: 500, marginBottom: 10 }}>👷 숨고에서 전문가 찾기</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {soomgoKeywords.map((kw, i) => (
                  <button key={i} onClick={() => openSoomgo(kw)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1a2a4a', border: '0.5px solid #60a5fa55', borderRadius: 20, padding: '8px 14px', textDecoration: 'none', color: '#60a5fa', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {kw}
                    <i className="ti ti-external-link" style={{ fontSize: 13, opacity: 0.7 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼 2개 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(soomgoKeyword + ' DIY 수리 방법')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: '#111828', border: '0.5px solid #1e3a5f', borderRadius: 14, padding: '16px 12px', textDecoration: 'none' }}>
              <span style={{ fontSize: 26 }}>🔧</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>DIY 수리</span>
              <span style={{ fontSize: 13, color: '#555', textAlign: 'center' }}>유튜브로 직접 수리하기</span>
            </a>
            <a href={`https://search.naver.com/search.naver?query=${encodeURIComponent(soomgoKeyword + ' 전문가')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 14, padding: '16px 12px', textDecoration: 'none' }}>
              <span style={{ fontSize: 26 }}>👷</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#60a5fa' }}>전문가 찾기</span>
              <span style={{ fontSize: 13, color: '#555', textAlign: 'center' }}>네이버에서 전문가 검색</span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
