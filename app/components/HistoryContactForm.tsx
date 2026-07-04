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
  defaultContractImage?: string
  defaultEstimateImage?: string
}

async function compressToBase64(file: File, maxSizeKB = 300): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      const maxDim = 1200
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      let quality = 0.80
      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      while (dataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.2) {
        quality -= 0.1
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }
      resolve(dataUrl.split(',')[1])
    }
    img.src = url
  })
}

function ImageUpload({ label, name, icon, color, defaultImage = '' }: {
  label: string; name: string; icon: string; color: string; defaultImage?: string
}) {
  const [image, setImage] = useState(defaultImage)
  const [loading, setLoading] = useState(false)

  async function handleFile(file: File) {
    setLoading(true)
    const base64 = await compressToBase64(file)
    setImage(base64)
    setLoading(false)
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type="hidden" name={name} value={image} />
      <label style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#111118', border: `1px dashed ${image ? color : '#2a2a38'}`,
        borderRadius: 12, padding: 14, cursor: 'pointer',
      }}>
        <input type="file" accept="image/*" capture="environment"
          style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/jpeg;base64,${image}`} alt={label}
              style={{ width: 72, height: 50, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, color, fontWeight: 500 }}>✓ {label} 첨부됨</p>
              <p style={{ fontSize: 13, color: '#555', marginTop: 2 }}>탭해서 다시 첨부</p>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ti ${icon}`} style={{ fontSize: 22, color }} />
            </div>
            <div>
              <p style={{ fontSize: 15, color: '#888' }}>{loading ? '처리 중...' : `${label} 촬영 / 업로드`}</p>
              <p style={{ fontSize: 13, color: '#444', marginTop: 2 }}>사진 또는 파일 이미지</p>
            </div>
          </>
        )}
      </label>
    </div>
  )
}

export default function HistoryContactForm({
  defaultName = '', defaultPhone = '', defaultCompany = '',
  defaultContactImage = '', defaultContractImage = '', defaultEstimateImage = '',
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
        const maxDim = 1200
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        let quality = 0.80
        let dataUrl = canvas.toDataURL('image/jpeg', quality)
        while (dataUrl.length > 300 * 1024 * 1.37 && quality > 0.2) {
          quality -= 0.1
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        }
        resolve(dataUrl)
      }
      img.src = url
    })
  }

  async function handleCardImage(file: File) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1]
      setContactImage(base64)
      setExtracting(true)
      try {
        const compressed = await compressImage(file)
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
    reader.readAsDataURL(file)
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

      <ImageUpload label="견적서" name="estimateImageBase64" icon="ti-file-invoice"
        color="#a78bfa" defaultImage={defaultEstimateImage} />
      <ImageUpload label="계약서" name="contractImageBase64" icon="ti-file-text"
        color="#34d399" defaultImage={defaultContractImage} />
    </div>
  )
}
