'use client'

import { useState, useEffect, useCallback } from 'react'

const FAST_TABS = ['home', 'inventory', 'history']
const ALL_TABS = ['home', 'history', 'inventory', 'doctor', 'utility', 'valuation']

interface Props {
  houseId: string
  defaultTab: string
  children: React.ReactNode  // 서버에서 렌더된 탭 컨텐츠들
}

export default function FastTabSwitcher({ houseId, defaultTab, children }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const switchTab = useCallback((tab: string) => {
    setActiveTab(tab)
    const url = `/houses/${houseId}?tab=${tab}`
    window.history.replaceState({}, '', url)
  }, [houseId])

  // 스와이프 지원
  useEffect(() => {
    let startX = 0, startY = 0
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX
      const dy = Math.abs(e.changedTouches[0].clientY - startY)
      if (Math.abs(dx) < 50 || dy > 120) return
      const idx = ALL_TABS.indexOf(activeTab)
      if (idx === -1) return
      const next = dx < 0 ? ALL_TABS[(idx + 1) % ALL_TABS.length] : ALL_TABS[(idx - 1 + ALL_TABS.length) % ALL_TABS.length]
      // 빠른 탭이면 client-side, 아니면 hard navigate
      if (FAST_TABS.includes(next)) {
        switchTab(next)
      } else {
        window.location.href = `/houses/${houseId}?tab=${next}`
      }
    }
    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchend', onEnd)
    }
  }, [activeTab, houseId, switchTab])

  // 브라우저 뒤로가기 지원
  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search)
      setActiveTab(params.get('tab') || 'home')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <div data-active-tab={activeTab}>
      {children}
    </div>
  )
}

// 개별 탭 컨텐츠 래퍼 - 서버에서 렌더 후 클라이언트에서 show/hide
export function FastTab({ tabKey, children }: { tabKey: string; children: React.ReactNode }) {
  return (
    <div data-tab-key={tabKey} className={`fast-tab fast-tab-${tabKey}`}>
      {children}
    </div>
  )
}
