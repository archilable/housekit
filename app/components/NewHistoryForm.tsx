'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 17, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: 14, color: '#888', display: 'block', marginBottom: 8 }
const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

interface Inventory { id: string; name: string; category: string; brand: string | null }

interface Props {
  houseId: string
  inventories: Inventory[]
  defaultTitle?: string
  defaultCategory?: string
  defaultInventoryId?: string
}

// ---- image compression ----
async function compressToBase64(file: File, maxSizeKB = 80): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지 로드 실패')) }
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      const maxDim = 500
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      let quality = 0.65
      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      while (dataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
        quality -= 0.05
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }
      resolve(dataUrl.split(',')[1])
    }
    img.src = url
  })
}

// ---- MultiImageUpload ----
function MultiImageUpload({ label, icon, color, images, setImages }: {
  label: string; icon: string; color: string
  images: string[]; setImages: (imgs: string[]) => void
}) {
  const [loading, setLoading] = useState(false)
  const [loadErr, setLoadErr] = useState('')

  async function handleFile(file: File) {
    setLoading(true); setLoadErr('')
    try {
      const base64 = await compressToBase64(file)
      setImages([...images, base64])
    } catch (e: any) {
      setLoadErr(e?.message || '이미지 처리 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/jpeg;base64,${img}`} alt={`${label} ${i + 1}`}
                style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: `1px solid ${color}44` }} />
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, background: '#f87171', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {loadErr && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{loadErr}</p>}
      <label style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#111118', border: `1px dashed ${images.length > 0 ? color : '#2a2a38'}`,
        borderRadius: 12, padding: 14, cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}>
        <input type="file" accept="image/*" capture="environment"
          style={{ display: 'none' }} disabled={loading}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {loading
            ? <span style={{ width: 18, height: 18, border: `2px solid ${color}44`, borderTopColor: color, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            : <i className={images.length > 0 ? 'ti ti-plus' : `ti ${icon}`} style={{ fontSize: 22, color }} />
          }
        </div>
        <div>
          <p style={{ fontSize: 15, color: '#888' }}>
            {loading ? '처리 중...' : images.length > 0 ? `${label} 추가` : `${label} 촬영 / 업로드`}
          </p>
          <p style={{ fontSize: 13, color: '#444', marginTop: 2 }}>
            {images.length > 0 ? `현재 ${images.length}장` : '여러 장 추가 가능'}
          </p>
        </div>
      </label>
    </div>
  )
}

// ---- ContactSection ----
function ContactSection({ name, setName, phone, setPhone, company, setCompany, contactImage, setContactImage }: {
  name: string; setName: (v: string) => void
  phone: string; setPhone: (v: string) => void
  company: string; setCompany: (v: string) => void
  contactImage: string; setContactImage: (v: string) => void
}) {
  const [extracting, setExtracting] = useState(false)

  async function handleCardImage(file: File) {
    setExtracting(true)
    try {
      const base64 = await compressToBase64(file, 80)
      setContactImage(base64)
      const res = await fetch('/api/extract-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: `data:image/jpeg;base64,${base64}`, mediaType: 'image/jpeg' }),
      })
      const data = await res.json()
      if (data.name) setName(data.name)
      if (data.phone) setPhone(data.phone)
      if (data.company) setCompany(data.company)
    } catch {
      // AI 추출 실패는 무시
    } finally {
      setExtracting(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#1e1e28' }} />
        <p style={{ fontSize: 13, color: '#444', whiteSpace: 'nowrap' }}>업체 / 담당자 정보</p>
        <div style={{ flex: 1, height: 1, background: '#1e1e28' }} />
      </div>
      <div>
        <label style={labelStyle}>명함 사진 (AI 자동추출)</label>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#111118', border: `1px dashed ${contactImage ? '#60a5fa' : '#2a2a38'}`,
          borderRadius: 12, padding: 14, cursor: 'pointer',
        }}>
          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleCardImage(e.target.files[0])} />
          {contactImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/jpeg;base64,${contactImage}`} alt="명함"
                style={{ width: 72, height: 50, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              <div>
                {extracting
                  ? <p style={{ fontSize: 14, color: '#60a5fa' }}>AI 분석 중...</p>
                  : <p style={{ fontSize: 14, color: '#34d399', fontWeight: 500 }}>✓ 명함 인식 완료</p>
                }
                <p style={{ fontSize: 13, color: '#555', marginTop: 2 }}>탭해서 다시 촬영</p>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#60a5fa22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="ti ti-id-badge" style={{ fontSize: 22, color: '#60a5fa' }} />
              </div>
              <div>
                <p style={{ fontSize: 15, color: '#888' }}>명함 촬영 / 업로드</p>
                <p style={{ fontSize: 13, color: '#444', marginTop: 2 }}>AI가 자동으로 정보를 읽어와요</p>
              </div>
            </>
          )}
        </label>
      </div>
      <div>
        <label style={labelStyle}>업체명</label>
        <input value={company} onChange={e => setCompany(e.target.value)} placeholder="○○ 인테리어" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>담당자 이름</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>연락처</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-1234-5678" type="tel" style={inputStyle} />
      </div>
    </>
  )
}

// ---- Main Form ----
export default function NewHistoryForm({ houseId, inventories, defaultTitle, defaultCategory, defaultInventoryId }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const today = new Date().toISOString().split('T')[0]

  // form fields
  const [inventoryId, setInventoryId] = useState(defaultInventoryId ?? '')
  const [category, setCategory] = useState(defaultCategory ?? '')
  const [title, setTitle] = useState(defaultTitle ?? '')
  const [description, setDescription] = useState('')
  const [doneAt, setDoneAt] = useState(today)
  const [cost, setCost] = useState('')

  // contact
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactCompany, setContactCompany] = useState('')
  const [contactImage, setContactImage] = useState('')

  // images — held in state, never in FormData
  const [workImages, setWorkImages] = useState<string[]>([])
  const [estimateImages, setEstimateImages] = useState<string[]>([])
  const [contractImages, setContractImages] = useState<string[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return
    if (!category || !title || !doneAt) { setError('구분, 제목, 작업일은 필수입니다'); return }
    setError('')
    setPending(true)

    console.log('[NewHistoryForm] submit est=', estimateImages.length, 'con=', contractImages.length)

    // fetch 대신 XMLHttpRequest 사용 (iOS PWA에서 fetch가 막히는 경우 우회)
    function xhr(method: string, body: object): Promise<any> {
      return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest()
        req.open(method, '/api/history/save')
        req.setRequestHeader('Content-Type', 'application/json')
        req.timeout = 30000
        req.onload = () => {
          try { resolve({ ok: req.status < 400, status: req.status, data: JSON.parse(req.responseText) }) }
          catch { resolve({ ok: false, status: req.status, data: { error: req.responseText } }) }
        }
        req.onerror = () => reject(new Error('네트워크 오류'))
        req.ontimeout = () => reject(new Error('요청 시간 초과 (30초)'))
        req.send(JSON.stringify(body))
      })
    }

    try {
      // 1단계: 메타데이터 저장 (이미지 제외)
      const meta = await xhr('POST', {
        houseId, inventoryId, category, title, description, cost, doneAt,
        contactName, contactPhone, contactCompany,
        contactImageBase64: contactImage,
        hasEstimate: estimateImages.length > 0 || workImages.length > 0,
        hasContract: contractImages.length > 0,
      })
      if (!meta.ok) {
        setError(meta.data.error || `저장 오류 (${meta.status})`)
        setPending(false)
        return
      }
      const { historyId } = meta.data

      // 2단계: 이미지 한 장씩 업로드
      for (let i = 0; i < workImages.length; i++) {
        const r = await xhr('PATCH', { historyId, type: 'photo', imageBase64: workImages[i], sortOrder: i })
        if (!r.ok) { setError(r.data.error || '현장 사진 저장 실패'); setPending(false); return }
      }
      for (let i = 0; i < estimateImages.length; i++) {
        const r = await xhr('PATCH', { historyId, type: 'estimate', imageBase64: estimateImages[i], sortOrder: i })
        if (!r.ok) { setError(r.data.error || '견적서 이미지 저장 실패'); setPending(false); return }
      }
      for (let i = 0; i < contractImages.length; i++) {
        const r = await xhr('PATCH', { historyId, type: 'contract', imageBase64: contractImages[i], sortOrder: i })
        if (!r.ok) { setError(r.data.error || '계약서 이미지 저장 실패'); setPending(false); return }
      }

      try { sessionStorage.removeItem(`house-data-${houseId}`) } catch {}
      window.location.href = `/houses/${houseId}?tab=history`
    } catch (err: any) {
      console.error('[NewHistoryForm] xhr error:', err)
      setError(err?.message || '네트워크 오류가 발생했습니다')
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={fieldStyle}>
        <label style={labelStyle}>관련 설비</label>
        <select value={inventoryId} onChange={e => setInventoryId(e.target.value)} style={{ ...inputStyle, appearance: 'none' as const }}>
          <option value="">설비 선택 (선택사항)</option>
          {inventories.map(inv => (
            <option key={inv.id} value={inv.id}>
              [{inv.category}] {inv.name}{inv.brand ? ` · ${inv.brand}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>구분 <span style={{ color: '#f87171' }}>*</span></label>
        <select value={category} onChange={e => setCategory(e.target.value)} required style={{ ...inputStyle, appearance: 'none' as const }}>
          <option value="">선택하세요</option>
          <option value="수리">수리</option>
          <option value="교체">교체</option>
          <option value="점검">점검</option>
          <option value="청소">청소</option>
          <option value="방역">방역</option>
          <option value="기타">기타</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>제목 <span style={{ color: '#f87171' }}>*</span></label>
        <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="보일러 수리, 누수 점검 등" style={inputStyle} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>상세 내용</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="작업 내용을 자세히 기록하세요" style={{ ...inputStyle, resize: 'none' as const }} />
      </div>

      <div style={fieldStyle}>
        <MultiImageUpload label="현장 사진" icon="ti-camera" color="#60a5fa"
          images={workImages} setImages={setWorkImages} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>작업일 <span style={{ color: '#f87171' }}>*</span></label>
        <input value={doneAt} onChange={e => setDoneAt(e.target.value)} type="date" required style={{ ...inputStyle, display: 'block', overflow: 'hidden' }} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>비용 (원)</label>
        <input value={cost} onChange={e => setCost(e.target.value)} type="number" placeholder="150000" min="0" style={inputStyle} />
      </div>

      <ContactSection
        name={contactName} setName={setContactName}
        phone={contactPhone} setPhone={setContactPhone}
        company={contactCompany} setCompany={setContactCompany}
        contactImage={contactImage} setContactImage={setContactImage}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#1e1e28' }} />
        <p style={{ fontSize: 13, color: '#444', whiteSpace: 'nowrap' }}>서류 첨부</p>
        <div style={{ flex: 1, height: 1, background: '#1e1e28' }} />
      </div>

      <MultiImageUpload label="견적서" icon="ti-file-invoice" color="#a78bfa"
        images={estimateImages} setImages={setEstimateImages} />
      <MultiImageUpload label="계약서" icon="ti-file-text" color="#34d399"
        images={contractImages} setImages={setContractImages} />

      {error && (
        <p style={{ color: '#f87171', fontSize: 14, background: '#2d1a1a', padding: '10px 14px', borderRadius: 10, border: '1px solid #f8717144' }}>
          오류: {error}
        </p>
      )}

      <button
        type="submit" disabled={pending}
        style={{
          marginTop: 4,
          background: pending ? '#162040' : '#1d4ed8',
          color: pending ? '#60a5fa' : '#fff',
          border: 'none', borderRadius: 14, padding: '15px',
          fontSize: 17, fontWeight: 500,
          cursor: pending ? 'not-allowed' : 'pointer',
          width: '100%', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {pending && <span style={{ width: 16, height: 16, border: '2px solid #60a5fa44', borderTopColor: '#60a5fa', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
        {pending ? '저장 중...' : '저장하기'}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </button>
    </form>
  )
}
