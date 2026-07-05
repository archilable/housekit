'use client'

import { useState, useRef } from 'react'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 17, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: 14, color: '#888', display: 'block', marginBottom: 8 }

interface Props {
  defaultName?: string
  defaultPhone?: string
  defaultCompany?: string
  defaultContactImage?: string
  defaultContractImages?: string[]
  defaultEstimateImages?: string[]
}

async function compressToBase64(file: File, maxSizeKB = 100): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      const maxDim = 600
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      let quality = 0.7
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

function MultiImageUpload({ label, namePrefix, icon, color, defaultImages = [] }: {
  label: string; namePrefix: string; icon: string; color: string; defaultImages?: string[]
}) {
  const [images, setImages] = useState<string[]>(defaultImages)
  const [loading, setLoading] = useState(false)

  async function handleFile(file: File) {
    setLoading(true)
    const base64 = await compressToBase64(file)
    setImages(prev => [...prev, base64])
    setLoading(false)
  }

  function remove(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {/* hidden inputs — 같은 name으로 여러 개, getAll()로 읽음 */}
      {images.map((img, i) => (
        <input key={i} type="hidden" name={namePrefix} value={img} />
      ))}

      {/* 썸네일 목록 */}
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/jpeg;base64,${img}`} alt={`${label} ${i + 1}`}
                style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: `1px solid ${color}44` }} />
              <button type="button" onClick={() => remove(i)}
                style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, background: '#f87171', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                ×
              </button>
              <p style={{ fontSize: 11, color: '#555', textAlign: 'center', marginTop: 2 }}>{i + 1}장</p>
            </div>
          ))}
        </div>
      )}

      {/* 추가 버튼 */}
      <label style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#111118', border: `1px dashed ${images.length > 0 ? color : '#2a2a38'}`,
        borderRadius: 12, padding: 14, cursor: 'pointer',
      }}>
        <input type="file" accept="image/*" capture="environment"
          style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {images.length > 0
            ? <i className="ti ti-plus" style={{ fontSize: 22, color }} />
            : <i className={`ti ${icon}`} style={{ fontSize: 22, color }} />
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

export default function HistoryContactForm({
  defaultName = '', defaultPhone = '', defaultCompany = '',
  defaultContactImage = '', defaultContractImages = [], defaultEstimateImages = [],
}: Props) {
  const [name, setName] = useState(defaultName)
  const [phone, setPhone] = useState(defaultPhone)
  const [company, setCompany] = useState(defaultCompany)
  const [contactImage, setContactImage] = useState(defaultContactImage)
  const [extracting, setExtracting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const maxDim = 600
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        let quality = 0.7
        let dataUrl = canvas.toDataURL('image/jpeg', quality)
        while (dataUrl.length > 100 * 1024 * 1.37 && quality > 0.1) {
          quality -= 0.05
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        }
        resolve(dataUrl)
      }
      img.src = url
    })
  }

  async function handleCardImage(file: File) {
    setExtracting(true)
    try {
      const compressed = await compressImage(file)
      // compressed is full dataUrl; strip prefix for storage
      const base64 = compressed.split(',')[1]
      setContactImage(base64)
      const res = await fetch('/api/extract-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: compressed, mediaType: 'image/jpeg' }),
      })
      const data = await res.json()
      if (data.name) setName(data.name)
      if (data.phone) setPhone(data.phone)
      if (data.company) setCompany(data.company)
    } finally {
      setExtracting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 구분선 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#1e1e28' }} />
        <p style={{ fontSize: 13, color: '#444', whiteSpace: 'nowrap' }}>업체 / 담당자 정보</p>
        <div style={{ flex: 1, height: 1, background: '#1e1e28' }} />
      </div>

      {/* 명함 업로드 */}
      <div>
        <label style={labelStyle}>명함 사진 (AI 자동추출)</label>
        <input type="hidden" name="contactImageBase64" value={contactImage} />
        <label style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#111118', border: `1px dashed ${contactImage ? '#60a5fa' : '#2a2a38'}`,
          borderRadius: 12, padding: 14, cursor: 'pointer',
        }}>
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }}
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

      {/* 직접 입력 */}
      <div>
        <label style={labelStyle}>업체명</label>
        <input name="contactCompany" value={company} onChange={e => setCompany(e.target.value)}
          placeholder="○○ 인테리어" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>담당자 이름</label>
        <input name="contactName" value={name} onChange={e => setName(e.target.value)}
          placeholder="홍길동" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>연락처</label>
        <input name="contactPhone" value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="010-1234-5678" type="tel" style={inputStyle} />
      </div>

      {/* 구분선 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#1e1e28' }} />
        <p style={{ fontSize: 13, color: '#444', whiteSpace: 'nowrap' }}>서류 첨부</p>
        <div style={{ flex: 1, height: 1, background: '#1e1e28' }} />
      </div>

      <MultiImageUpload label="견적서" namePrefix="estimateImage" icon="ti-file-invoice"
        color="#a78bfa" defaultImages={defaultEstimateImages} />
      <MultiImageUpload label="계약서" namePrefix="contractImage" icon="ti-file-text"
        color="#34d399" defaultImages={defaultContractImages} />
    </div>
  )
}
