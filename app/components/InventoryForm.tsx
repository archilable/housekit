'use client'

import { useRef, useState } from 'react'
import SubmitButton from './SubmitButton'
import ContactForm from './ContactForm'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 17, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: 14, color: '#888', display: 'block', marginBottom: 8 }
const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

interface Props {
  houseId: string
  action: (formData: FormData) => Promise<void>
  defaultValues?: {
    category?: string
    name?: string
    brand?: string
    model?: string
    installedAt?: string
    warrantyMonths?: number
    notes?: string
  }
}

export default function InventoryForm({ houseId, action, defaultValues = {} }: Props) {
  const [brand, setBrand] = useState(defaultValues.brand ?? '')
  const [model, setModel] = useState(defaultValues.model ?? '')
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const imageBase64 = ev.target?.result as string
      setPreview(imageBase64)
      setScanning(true)
      try {
        const res = await fetch('/api/scan-model', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64 }),
        })
        const data = await res.json()
        if (data.brand) setBrand(data.brand)
        if (data.model) setModel(data.model)
      } finally {
        setScanning(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <input type="hidden" name="houseId" value={houseId} />

      <div style={fieldStyle}>
        <label style={labelStyle}>카테고리 <span style={{ color: '#f87171' }}>*</span></label>
        <select name="category" required defaultValue={defaultValues.category ?? ''} style={{ ...inputStyle, appearance: 'none' as const }}>
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
        <input name="name" required placeholder="거실 에어컨" defaultValue={defaultValues.name} style={inputStyle} />
      </div>

      {/* 모델 스캔 */}
      <div style={{ background: '#111118', border: '0.5px solid #2a2a38', borderRadius: 14, padding: 16 }}>
        <p style={{ fontSize: 13, color: '#60a5fa', marginBottom: 12, fontWeight: 600 }}>
          <i className="ti ti-scan" style={{ marginRight: 6 }} />
          라벨 스캔으로 자동 입력
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleScan}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={scanning}
          style={{
            width: '100%', background: scanning ? '#1a1a24' : '#1d3a6e',
            border: '0.5px solid #2a4a8f', borderRadius: 10,
            padding: '12px', fontSize: 15, color: scanning ? '#555' : '#60a5fa',
            cursor: scanning ? 'not-allowed' : 'pointer', fontWeight: 600,
          }}
        >
          {scanning ? '🔍 인식 중...' : '📷 제품 라벨 촬영'}
        </button>

        {preview && (
          <img src={preview} alt="스캔 이미지" style={{ width: '100%', borderRadius: 8, marginTop: 10, maxHeight: 160, objectFit: 'cover' }} />
        )}
        {scanning && (
          <p style={{ fontSize: 13, color: '#60a5fa', textAlign: 'center', marginTop: 8 }}>AI가 모델명을 인식하고 있어요...</p>
        )}
        {!scanning && (brand || model) && preview && (
          <p style={{ fontSize: 13, color: '#34d399', textAlign: 'center', marginTop: 8 }}>✅ 인식 완료! 아래 내용을 확인해주세요</p>
        )}
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>브랜드</label>
        <input name="brand" placeholder="삼성, LG 등" style={inputStyle} value={brand} onChange={e => setBrand(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>모델명</label>
        <input name="model" placeholder="AF17TX700HFH" style={inputStyle} value={model} onChange={e => setModel(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>설치일</label>
        <input name="installedAt" type="date" defaultValue={defaultValues.installedAt} style={{ ...inputStyle, display: 'block', overflow: 'hidden' }} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>보증기간 (개월)</label>
        <input name="warrantyMonths" type="number" placeholder="24" min="1" defaultValue={defaultValues.warrantyMonths} style={inputStyle} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>메모</label>
        <textarea name="notes" rows={3} placeholder="추가 정보" defaultValue={defaultValues.notes} style={{ ...inputStyle, resize: 'none' as const }} />
      </div>

      <ContactForm />

      <SubmitButton label="추가하기" loadingLabel="저장 중..." />
    </form>
  )
}
