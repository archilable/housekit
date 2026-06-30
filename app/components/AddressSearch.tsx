'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  defaultAddress?: string
  defaultAddressDetail?: string
}

declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: { roadAddress: string; jibunAddress: string }) => void
        onresize?: (size: { width: number; height: number }) => void
        width?: string
        height?: string
      }) => { embed: (el: HTMLElement) => void; open: () => void }
    }
  }
}

export default function AddressSearch({ defaultAddress = '', defaultAddressDetail = '' }: Props) {
  const [address, setAddress] = useState(defaultAddress)
  const [detail, setDetail] = useState(defaultAddressDetail)
  const [showSearch, setShowSearch] = useState(false)
  const embedRef = useRef<HTMLDivElement>(null)
  const scriptLoaded = useRef(false)

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
    borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#fff',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', display: 'block',
  }

  function loadScript(cb: () => void) {
    if (scriptLoaded.current) { cb(); return }
    const s = document.createElement('script')
    s.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    s.onload = () => { scriptLoaded.current = true; cb() }
    document.head.appendChild(s)
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
        },
        width: '100%',
        height: '100%',
      }).embed(embedRef.current)
    })
  }, [showSearch])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* hidden inputs for form submission */}
      <input type="hidden" name="address" value={address} />

      {/* 주소 표시 + 검색 버튼 */}
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
          <i className="ti ti-search" style={{ fontSize: 16, color: '#60a5fa', flexShrink: 0 }} />
        </div>
      </div>

      {/* 검색 레이어 */}
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
            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '0.5px solid #1e1e28', flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>주소 검색</span>
              <button onClick={() => setShowSearch(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 22, padding: 4, lineHeight: 1 }}>
                ✕
              </button>
            </div>
            {/* 카카오 우편번호 embed 영역 */}
            <div ref={embedRef} style={{ flex: 1, overflow: 'hidden' }} />
          </div>
        </div>
      )}

      {/* 상세주소 */}
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
