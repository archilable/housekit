'use client'

import { useState, useRef } from 'react'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: 12, color: '#888', display: 'block', marginBottom: 8 }

interface Props {
  defaultName?: string
  defaultPhone?: string
  defaultCompany?: string
  defaultImage?: string
}

export default function ContactForm({ defaultName = '', defaultPhone = '', defaultCompany = '', defaultImage = '' }: Props) {
  const [name, setName] = useState(defaultName)
  const [phone, setPhone] = useState(defaultPhone)
  const [company, setCompany] = useState(defaultCompany)
  const [image, setImage] = useState(defaultImage)
  const [extracting, setExtracting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImage(file: File) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1]
      setImage(base64)
      setExtracting(true)
      try {
        const res = await fetch('/api/extract-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mediaType: file.type }),
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
        <p style={{ fontSize: 11, color: '#444', whiteSpace: 'nowrap' }}>설치업체 / 담당자 정보</p>
        <div style={{ flex: 1, height: 1, background: '#1e1e28' }} />
      </div>

      {/* 명함 업로드 */}
      <div>
        <label style={labelStyle}>명함 사진 업로드 (AI 자동추출)</label>
        <input type="hidden" name="contactImageBase64" value={image} />
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: '#111118', border: `1px dashed ${image ? '#3b82f6' : '#2a2a38'}`,
          borderRadius: 12, padding: '14px', cursor: 'pointer', minHeight: 80,
        }}>
          <input
            ref={fileRef} type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])}
          />
          {image ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/jpeg;base64,${image}`} alt="명함" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6 }} />
              <div style={{ flex: 1 }}>
                {extracting ? (
                  <p style={{ fontSize: 12, color: '#60a5fa' }}>AI 분석 중...</p>
                ) : (
                  <p style={{ fontSize: 12, color: '#34d399' }}>✓ 명함 인식 완료</p>
                )}
                <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>탭해서 다시 촬영</p>
              </div>
            </div>
          ) : (
            <>
              <i className="ti ti-camera" style={{ fontSize: 22, color: '#555' }} />
              <div>
                <p style={{ fontSize: 13, color: '#888' }}>명함 촬영 / 업로드</p>
                <p style={{ fontSize: 11, color: '#444', marginTop: 2 }}>AI가 자동으로 정보를 읽어와요</p>
              </div>
            </>
          )}
        </label>
      </div>

      {/* 직접 입력 */}
      <div>
        <label style={labelStyle}>업체명</label>
        <input name="contactCompany" value={company} onChange={e => setCompany(e.target.value)}
          placeholder="○○ 보일러 서비스" style={inputStyle} />
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
    </div>
  )
}
