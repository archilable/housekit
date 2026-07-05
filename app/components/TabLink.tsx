'use client'

import { useCallback } from 'react'

interface Props {
  houseId: string
  tab: string
  highlight?: string
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export default function TabLink({ houseId, tab, highlight, children, style, className }: Props) {
  const href = highlight
    ? `/houses/${houseId}?tab=${tab}&highlight=${highlight}`
    : `/houses/${houseId}?tab=${tab}`

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const container = document.getElementById(`tab-container-${houseId}`)
    if (container) container.setAttribute('data-active-tab', tab)
    window.history.pushState({}, '', href)
    // FastTabNav의 popstate 리스너가 탭 활성화 처리
    window.dispatchEvent(new PopStateEvent('popstate'))
    // highlight된 이력 카드로 스크롤
    if (highlight) {
      setTimeout(() => {
        document.getElementById(`history-${highlight}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    }
  }, [houseId, tab, href, highlight])

  return (
    <a href={href} onClick={handleClick} style={style} className={className}>
      {children}
    </a>
  )
}
