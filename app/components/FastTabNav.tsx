'use client'

import { useState, useEffect } from 'react'

const ALL_TABS = ['home', 'history', 'inventory', 'doctor', 'utility', 'valuation']
const FAST_TABS = new Set(['home', 'history', 'inventory', 'doctor', 'utility', 'valuation'])

const TAB_LABELS: Record<string, string> = {
  home: '홈', history: '이력', inventory: '설비',
  doctor: '닥터', utility: '공과금', valuation: '시세',
}

export default function FastTabNav({ houseId, initialTab }: { houseId: string; initialTab: string }) {
  const [active, setActive] = useState(initialTab)

  function switchTab(key: string) {
    if (!FAST_TABS.has(key)) {
      // 느린 탭은 URL 이동
      window.location.href = `/houses/${houseId}?tab=${key}`
      return
    }
    setActive(key)
    // 부모 컨테이너의 data-active-tab 변경 → CSS가 자동으로 show/hide
    document.getElementById(`tab-container-${houseId}`)?.setAttribute('data-active-tab', key)
    window.history.replaceState({}, '', `/houses/${houseId}?tab=${key}`)
  }

  // 스와이프 지원
  useEffect(() => {
    let startX = 0, startY = 0
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY }
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX
      const dy = Math.abs(e.changedTouches[0].clientY - startY)
      if (Math.abs(dx) < 50 || dy > 120) return
      const idx = ALL_TABS.indexOf(active)
      if (idx === -1) return
      const next = dx < 0
        ? ALL_TABS[(idx + 1) % ALL_TABS.length]
        : ALL_TABS[(idx - 1 + ALL_TABS.length) % ALL_TABS.length]
      switchTab(next)
    }
    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchend', onEnd)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // 뒤로가기 지원
  useEffect(() => {
    const onPop = () => {
      const key = new URLSearchParams(window.location.search).get('tab') || 'home'
      setActive(key)
      document.getElementById(`tab-container-${houseId}`)?.setAttribute('data-active-tab', key)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [houseId])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 0, borderBottom: '0.5px solid #1e1e28', marginBottom: 16, padding: '0 16px', overflowX: 'auto' }}>
      {ALL_TABS.map(key => (
        <button
          key={key}
          onClick={() => switchTab(key)}
          style={{
            textAlign: 'center', padding: '10px 14px', fontSize: 17,
            color: active === key ? '#60a5fa' : '#555',
            borderBottom: active === key ? '2px solid #60a5fa' : '2px solid transparent',
            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
            background: 'none', cursor: 'pointer', fontWeight: active === key ? 500 : 400,
            fontFamily: 'inherit', marginBottom: -0.5, whiteSpace: 'nowrap',
          }}
        >
          {TAB_LABELS[key]}
        </button>
      ))}
    </div>
  )
}
