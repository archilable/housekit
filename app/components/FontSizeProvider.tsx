'use client'

import { useEffect, useState } from 'react'

export default function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [large, setLarge] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('largeText') === 'true'
    setLarge(saved)
    document.documentElement.setAttribute('data-text', saved ? 'large' : 'normal')
  }, [])

  function toggle() {
    const next = !large
    setLarge(next)
    localStorage.setItem('largeText', String(next))
    document.documentElement.setAttribute('data-text', next ? 'large' : 'normal')
  }

  return (
    <>
      {children}
      <button
        onClick={toggle}
        aria-label="글씨 크기 변경"
        style={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 200,
          background: large ? '#1d4ed8' : 'rgba(20,20,28,0.92)',
          border: large ? '1px solid #3b82f6' : '0.5px solid #2a2a38',
          borderRadius: 24,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
          color: '#fff',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: large ? 16 : 13, fontWeight: 600, lineHeight: 1 }}>가</span>
        <span style={{ fontSize: large ? 12 : 10, color: large ? '#fff' : '#888' }}>
          {large ? '큰 글씨' : '글씨 크기'}
        </span>
      </button>
    </>
  )
}
