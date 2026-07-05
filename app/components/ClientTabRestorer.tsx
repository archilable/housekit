'use client'

import { useEffect } from 'react'

// 마운트 시 URL의 tab/highlight 파라미터를 읽어 탭 전환 및 하이라이트 적용
// 서버 컴포넌트에서 searchParams를 제거해 ISR이 실제로 작동하게 하기 위한 클라이언트 복원 컴포넌트
export default function ClientTabRestorer({ houseId }: { houseId: string }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    const highlight = params.get('highlight')

    if (tab && tab !== 'home') {
      const container = document.getElementById(`tab-container-${houseId}`)
      if (container) container.setAttribute('data-active-tab', tab)
    }

    if (highlight) {
      const scroll = () => {
        const el = document.getElementById(`history-${highlight}`) ||
          document.querySelector(`[data-inventory-id="${highlight}"]`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      setTimeout(scroll, 200)
    }
  }, [houseId])

  return null
}
