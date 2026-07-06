'use client'

import { useEffect, useRef, useState } from 'react'

interface BuildingInfo {
  houseType: string
}

interface Props {
  defaultAddress?: string
  defaultAddressDetail?: string
  onBuildingInfo?: (info: BuildingInfo) => void
}

declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: {
          roadAddress: string
          jibunAddress: string
          sido: string
          sigungu: string
          bname: string
          bname1: string
          bnum: string
          bnum2: string
          apartment: string
          buildingName: string
          autoRoadAddress: string
          autoJibunAddress: string
        }) => void
        onresize?: (size: { width: number; height: number }) => void
        width?: string
        height?: string
      }) => { embed: (el: HTMLElement) => void; open: () => void }
    }
  }
}

export default function AddressSearch({ defaultAddress = '', defaultAddressDetail = '', onBuildingInfo }: Props) {
  const [address, setAddress] = useState(defaultAddress)
  const [detail, setDetail] = useState(defaultAddressDetail)
  const [showSearch, setShowSearch] = useState(false)
  const embedRef = useRef<HTMLDivElement>(null)
  const scriptLoaded = useRef(false)

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
    borderRadius: 10, padding: '12px 14px', fontSize: 17, color: '#fff',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', display: 'block',
  }

  function loadScript(cb: () => void) {
    if (scriptLoaded.current) { cb(); return }
    const s = document.createElement('script')
    s.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    s.onload = () => { scriptLoaded.current = true; cb() }
    document.head.appendChild(s)
  }

  function inferHouseType(data: { apartment: string; buildingName: string }): string {
    if (data.apartment === 'Y') return '아파트'
    const name = data.buildingName || ''
    if (name.includes('빌라') || name.includes('연립')) return '빌라/연립'
    if (name.includes('다가구') || name.includes('원룸') || name.includes('다세대')) return '다가구'
    if (name.includes('단독') || name.includes('주택')) return '단독주택'
    return ''
  }

  useEffect(() => {
    if (!showSearch || !embedRef.current) return
    loadScript(() => {
      if (!embedRef.current) return
      new window.daum.Postcode({
        oncomplete: (data) => {
          setAddress(data.roadAddress || data.jibunAddress)
          setShowSearch(false)
          setTimeout(() => {
            document.getElementById('address-detail-input')?.focus()
          }, 100)
          if (onBuildingInfo) {
            const houseType = inferHouseType(data)
            if (houseType) onBuildingInfo({ houseType })
          }
        },
        width: '100%',
        height: '100%',
      }).embed(embedRef.current)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSearch])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input type="hidden" name="address" value={address} />

      <div style={{ position: 'relative' }}>
        <div
          onClick={() => setShowSearch(true)}
          style={{
            ...inputStyle,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            color: address ? '#fff' : '#555',
            minHeight: 48,
          }}
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {address || '주소 검색 (예: 연희동, 연희로)'}
          </span>
          <i className="ti ti-search" style={{ fontSize: 18, color: '#60a5fa', flexShrink: 0 }} />
        </div>
      </div>

      {showSearch && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            background: '#0a0a0f', borderTop: '0.5px solid #1e1e28',
            marginTop: 'auto', borderRadius: '20px 20px 0 0',
            height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '0.5px solid #1e1e28', flexShrink: 0 }}>
              <span style={{ fontSize: 17, fontWeight: 500 }}>주소 검색</span>
              <button onClick={() => setShowSearch(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 24, padding: 4, lineHeight: 1 }}>
                ✕
              </button>
            </div>
            <div ref={embedRef} style={{ flex: 1, overflow: 'hidden' }} />
          </div>
        </div>
      )}

      {address && (
        <input
          id="address-detail-input"
          name="addressDetail"
          type="text"
          placeholder="상세주소 (동/호수)"
          defaultValue={detail}
          onChange={e => setDetail(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  )
}
