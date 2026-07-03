'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TABS = ['home', 'history', 'inventory', 'doctor', 'utility', 'valuation']

export default function SwipeableTabContent({
  houseId,
  currentTab,
  children,
}: {
  houseId: string
  currentTab: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const startX = useRef(0)
  const startY = useRef(0)
  const currentTabRef = useRef(currentTab)

  // currentTab이 바뀔 때마다 ref 동기화 (클로저 문제 방지)
  useEffect(() => {
    currentTabRef.current = currentTab
  }, [currentTab])

  useEffect(() => {
    function onStart(e: TouchEvent) {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
    }

    function onEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - startX.current
      const dy = Math.abs(e.changedTouches[0].clientY - startY.current)
      if (Math.abs(dx) < 50 || dy > 120) return

      const idx = TABS.indexOf(currentTabRef.current)
      if (idx === -1) return

      if (dx < 0) {
        router.push(`/houses/${houseId}?tab=${TABS[(idx + 1) % TABS.length]}`)
      } else {
        router.push(`/houses/${houseId}?tab=${TABS[(idx - 1 + TABS.length) % TABS.length]}`)
      }
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchend', onEnd)
    }
  }, [houseId, router])

  return <>{children}</>
}
