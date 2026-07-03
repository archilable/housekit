'use client'

import { useRef } from 'react'
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
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)

    if (Math.abs(dx) < 60 || dy > 80) return

    const idx = TABS.indexOf(currentTab)
    if (dx < 0 && idx < TABS.length - 1) {
      router.push(`/houses/${houseId}?tab=${TABS[idx + 1]}`)
    } else if (dx > 0 && idx > 0) {
      router.push(`/houses/${houseId}?tab=${TABS[idx - 1]}`)
    }
  }

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ touchAction: 'pan-y' }}>
      {children}
    </div>
  )
}
