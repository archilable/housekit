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
  const ref = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startY = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function onStart(e: TouchEvent) {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
    }

    function onEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - startX.current
      const dy = Math.abs(e.changedTouches[0].clientY - startY.current)
      if (Math.abs(dx) < 60 || dy > 100) return

      const idx = TABS.indexOf(currentTab)
      if (dx < 0 && idx < TABS.length - 1) {
        router.push(`/houses/${houseId}?tab=${TABS[idx + 1]}`)
      } else if (dx > 0 && idx > 0) {
        router.push(`/houses/${houseId}?tab=${TABS[idx - 1]}`)
      }
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchend', onEnd)
    }
  }, [currentTab, houseId, router])

  return (
    <div ref={ref}>
      {children}
    </div>
  )
}
