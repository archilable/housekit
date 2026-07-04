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
  defaultImage?: string
}

export default function ContactForm({ defaultName = '', defaultPhone = '', defaultCompany = '', defaultImage = '' }: Props) {
  const [name, setName] = useState(defaultName)
  const [phone, setPhone] = useState(defaultPhone)
  const [company, setCompany] = useState(defaultCompany)
  const [image, setImage] = useState(defaultImage)
  const [extracting, setExtracting] = useState(false)
  const [extractMsg, setExtractMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function compressImage(file: File, maxSizeKB = 1024): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const maxDim = 1600
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        let quality = 0.85
        let dataUrl = canvas.toDataURL('image/jpeg', quality)
        while (dataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.3) {
          quality -= 0.1
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        }
        resolve(dataUrl)
      }
      img.src = url
    })
  }

  async function handleImage(file: File) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      const base64 = dataUrl.split(',')[1]
      setImage(base64)
      setExtracting(true)
      setExtractMsg(null)
      try {
        const compressed = await compressImage(file)
        const res = await fetch('/api/extract-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: compressed, mediaType: 'image/jpeg' }),
        })
        const data = await res.json()
        const filled = data.name || data.phone || data.company
        if (filled) {
          if (data.name) setName(data.name)
          if (data.phone) setPhone(data.phone)
          if (data.company) setCompany(data.company)
          setExtractMsg({ ok: true, text: '✅ 명함 인식 완료! 아래 내용을 확인해주세요' })
        } else {
          setExtractMsg({ ok: false, text: '⚠️ 명함을 인식하지 못했어요. 다시 촬영해주세요.' })
        }
      } catch {
        setExtractMsg({ ok: false, text: '⚠️ 인식 실패. 다시 시도해주세요.' })
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
        <p style={{ fontSize: 13, color: '#444', whiteSpace: 'nowrap' }}>설치업체 / 담당자 정보</p>
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
                  <p style={{ fontSize: 14, color: '#60a5fa' }}>AI 분석 중...</p>
                ) : extractMsg ? (
                  <p style={{ fontSize: 14, color: extractMsg.ok ? '#34d399' : '#f87171' }}>{extractMsg.text}</p>
                ) : (
                  <p style={{ fontSize: 14, color: '#34d399' }}>✓ 업로드 완료</p>
                )}
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
