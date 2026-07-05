'use client'

import { useRef, useState } from 'react'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 17, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: 14, color: '#888', display: 'block', marginBottom: 8 }
const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

interface Props {
  houseId: string
  inventoryId?: string  // 수정 모드일 때 전달
  defaultValues?: {
    category?: string
    name?: string
    brand?: string
    model?: string
    installedAt?: string
    warrantyMonths?: number | null
    notes?: string | null
    contactName?: string | null
    contactPhone?: string | null
    contactCompany?: string | null
    contactImageBase64?: string | null
  }
}

export default function InventoryForm({ houseId, inventoryId, defaultValues = {} }: Props) {
  const d = defaultValues
  const [category, setCategory] = useState(d.category ?? '')
  const [name, setName] = useState(d.name ?? '')
  const [brand, setBrand] = useState(d.brand ?? '')
  const [model, setModel] = useState(d.model ?? '')
  const [installedAt, setInstalledAt] = useState(d.installedAt ?? '')
  const [warrantyMonths, setWarrantyMonths] = useState(d.warrantyMonths ? String(d.warrantyMonths) : '')
  const [notes, setNotes] = useState(d.notes ?? '')
  const [contactName, setContactName] = useState(d.contactName ?? '')
  const [contactPhone, setContactPhone] = useState(d.contactPhone ?? '')
  const [contactCompany, setContactCompany] = useState(d.contactCompany ?? '')
  const [contactImage, setContactImage] = useState(d.contactImageBase64 ?? '')

  const [scanning, setScanning] = useState(false)
  const [scanPreview, setScanPreview] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanOk, setScanOk] = useState(false)

  const [extracting, setExtracting] = useState(false)
  const [extractMsg, setExtractMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const scanFileRef = useRef<HTMLInputElement>(null)
  const contactFileRef = useRef<HTMLInputElement>(null)

  // 라벨 스캔
  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const imageBase64 = ev.target?.result as string
      setScanPreview(imageBase64)
      setScanning(true)
      setScanError(null)
      setScanOk(false)
      try {
        const res = await fetch('/api/scan-model', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64 }),
        })
        if (!res.ok) throw new Error(`서버 오류 ${res.status}`)
        const data = await res.json()
        if (data.brand) setBrand(data.brand)
        if (data.model) setModel(data.model)
        if (!data.brand && !data.model) {
          setScanError('모델명을 인식하지 못했어요. 라벨이 잘 보이게 다시 찍어주세요.')
        } else {
          setScanOk(true)
        }
      } catch (e: unknown) {
        setScanError(e instanceof Error ? e.message : '인식 실패')
      } finally {
        setScanning(false)
      }
    }
    reader.readAsDataURL(file)
  }

  // 명함 이미지 압축
  async function compressImage(file: File, maxSizeKB = 200): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const maxDim = 800
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        let quality = 0.75
        let dataUrl = canvas.toDataURL('image/jpeg', quality)
        while (dataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.2) {
          quality -= 0.1
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        }
        resolve(dataUrl)
      }
      img.onerror = () => { URL.revokeObjectURL(url); resolve('') }
      img.src = url
    })
  }

  // 명함 촬영
  async function handleContactImage(file: File) {
    setExtracting(true)
    setExtractMsg(null)
    try {
      const compressed = await compressImage(file)
      if (!compressed) throw new Error('이미지 압축 실패')
      const base64only = compressed.split(',')[1]
      setContactImage(base64only)
      const res = await fetch('/api/extract-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: compressed, mediaType: 'image/jpeg' }),
      })
      const data = await res.json()
      if (data.name || data.phone || data.company) {
        if (data.name) setContactName(data.name)
        if (data.phone) setContactPhone(data.phone)
        if (data.company) setContactCompany(data.company)
        setExtractMsg({ ok: true, text: '✅ 명함 인식 완료!' })
      } else {
        setExtractMsg({ ok: false, text: '⚠️ 인식 실패. 직접 입력해주세요.' })
      }
    } catch {
      setExtractMsg({ ok: false, text: '⚠️ 인식 실패. 다시 시도해주세요.' })
    } finally {
      setExtracting(false)
    }
  }

  // XHR 저장 (iOS PWA 호환)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !name) {
      setSubmitError('카테고리와 설비명은 필수입니다.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)

    const body = JSON.stringify({
      houseId, inventoryId,
      category, name, brand, model, installedAt, warrantyMonths, notes,
      contactName, contactPhone, contactCompany,
      contactImageBase64: contactImage || null,
    })

    const method = inventoryId ? 'PATCH' : 'POST'
    const xhr = new XMLHttpRequest()
    xhr.open(method, '/api/inventory/save')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300 && data.ok) {
          try { sessionStorage.removeItem(`house-data-${houseId}`) } catch {}
          window.location.href = `/houses/${houseId}?tab=inventory`
        } else {
          setSubmitError(data.error ?? '저장 실패')
          setSubmitting(false)
        }
      } catch {
        setSubmitError('응답 오류')
        setSubmitting(false)
      }
    }
    xhr.onerror = () => { setSubmitError('네트워크 오류'); setSubmitting(false) }
    xhr.send(body)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {submitError && (
        <div style={{ background: '#1a0d0d', border: '1px solid #f87171', borderRadius: 10, padding: '12px 14px', color: '#f87171', fontSize: 15 }}>
          ⚠️ {submitError}
        </div>
      )}

      <div style={fieldStyle}>
        <label style={labelStyle}>카테고리 <span style={{ color: '#f87171' }}>*</span></label>
        <select required value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, appearance: 'none' as const }}>
          <option value="">선택하세요</option>
          <option value="보일러">보일러</option>
          <option value="에어컨">에어컨</option>
          <option value="정수기">정수기</option>
          <option value="냉장고">냉장고</option>
          <option value="세탁기">세탁기</option>
          <option value="건조기">건조기</option>
          <option value="도어락">도어락</option>
          <option value="기타">기타</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>설비명 <span style={{ color: '#f87171' }}>*</span></label>
        <input required placeholder="거실 에어컨" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
      </div>

      {/* 라벨 스캔 */}
      <div style={{ background: '#111118', border: '0.5px solid #2a2a38', borderRadius: 14, padding: 16 }}>
        <p style={{ fontSize: 13, color: '#60a5fa', marginBottom: 12, fontWeight: 600 }}>
          <i className="ti ti-scan" style={{ marginRight: 6 }} />
          라벨 스캔으로 자동 입력
        </p>
        <input ref={scanFileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleScan} />
        <button type="button" onClick={() => scanFileRef.current?.click()} disabled={scanning}
          style={{ width: '100%', background: scanning ? '#1a1a24' : '#1d3a6e', border: '0.5px solid #2a4a8f', borderRadius: 10, padding: '12px', fontSize: 15, color: scanning ? '#555' : '#60a5fa', cursor: scanning ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
          {scanning ? '🔍 인식 중...' : '📷 제품 라벨 촬영'}
        </button>
        {scanPreview && <img src={scanPreview} alt="스캔" style={{ width: '100%', borderRadius: 8, marginTop: 10, maxHeight: 160, objectFit: 'cover' }} />}
        {scanning && <p style={{ fontSize: 13, color: '#60a5fa', textAlign: 'center', marginTop: 8 }}>AI가 모델명을 인식하고 있어요...</p>}
        {scanOk && !scanning && <p style={{ fontSize: 13, color: '#34d399', textAlign: 'center', marginTop: 8 }}>✅ 인식 완료! 아래 내용을 확인해주세요</p>}
        {scanError && <p style={{ fontSize: 13, color: '#f87171', textAlign: 'center', marginTop: 8 }}>⚠️ {scanError}</p>}
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>브랜드</label>
        <input placeholder="삼성, LG 등" value={brand} onChange={e => setBrand(e.target.value)} style={inputStyle} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>모델명</label>
        <input placeholder="AF17TX700HFH" value={model} onChange={e => setModel(e.target.value)} style={inputStyle} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>설치일</label>
        <input type="date" value={installedAt} onChange={e => setInstalledAt(e.target.value)} style={{ ...inputStyle, display: 'block', overflow: 'hidden' }} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>보증기간 (개월)</label>
        <input type="number" placeholder="24" min="1" value={warrantyMonths} onChange={e => setWarrantyMonths(e.target.value)} style={inputStyle} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>메모</label>
        <textarea rows={3} placeholder="추가 정보" value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inputStyle, resize: 'none' as const }} />
      </div>

      {/* 담당자 정보 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#1e1e28' }} />
          <p style={{ fontSize: 13, color: '#444', whiteSpace: 'nowrap' }}>설치업체 / 담당자 정보</p>
          <div style={{ flex: 1, height: 1, background: '#1e1e28' }} />
        </div>

        <div>
          <label style={labelStyle}>명함 사진 업로드 (AI 자동추출)</label>
          <input ref={contactFileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleContactImage(e.target.files[0])} />
          <label onClick={() => contactFileRef.current?.click()} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#111118', border: `1px dashed ${contactImage ? '#3b82f6' : '#2a2a38'}`,
            borderRadius: 12, padding: '14px', cursor: 'pointer', minHeight: 80,
          }}>
            {contactImage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`data:image/jpeg;base64,${contactImage}`} alt="명함" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                <div style={{ flex: 1 }}>
                  {extracting ? <p style={{ fontSize: 14, color: '#60a5fa' }}>AI 분석 중...</p>
                    : extractMsg ? <p style={{ fontSize: 14, color: extractMsg.ok ? '#34d399' : '#f87171' }}>{extractMsg.text}</p>
                    : <p style={{ fontSize: 14, color: '#34d399' }}>✓ 업로드 완료</p>}
                  <p style={{ fontSize: 13, color: '#555', marginTop: 2 }}>탭해서 다시 촬영</p>
                </div>
              </div>
            ) : (
              <>
                <i className="ti ti-camera" style={{ fontSize: 24, color: '#555' }} />
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
          <input placeholder="○○ 보일러 서비스" value={contactCompany} onChange={e => setContactCompany(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>담당자 이름</label>
          <input placeholder="홍길동" value={contactName} onChange={e => setContactName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>연락처</label>
          <input placeholder="010-1234-5678" type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <button type="submit" disabled={submitting} style={{
        width: '100%', background: submitting ? '#1a1a24' : '#1d4ed8', color: submitting ? '#555' : '#fff',
        border: 'none', borderRadius: 14, padding: '15px', fontSize: 17, fontWeight: 500,
        cursor: submitting ? 'not-allowed' : 'pointer',
      }}>
        {submitting ? '저장 중...' : (inventoryId ? '저장하기' : '추가하기')}
      </button>
    </form>
  )
}
