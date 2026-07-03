'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import DeleteHouseButton from './DeleteHouseButton'

interface House {
  id: string
  address: string
  addressDetail: string | null
  houseType: string
  buildYear: number | null
  sortOrder: number
  _count: { inventories: number; histories: number }
}

function calcHealthScore(inv: number, hist: number) {
  return Math.min(40 + Math.min(inv * 8, 30) + Math.min(hist * 6, 30), 100)
}

export default function SortableHouseList({ initialHouses }: { initialHouses: House[] }) {
  const [houses, setHouses] = useState(initialHouses)
  const [saving, setSaving] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)

  const touchStartX = useRef(0)
  const dragStartX = useRef(0)
  const isDragging = useRef(false)
  const cardWidth = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 스크롤 위치로 현재 카드 감지
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const gap = 12
      const cw = el.querySelector('div')?.offsetWidth ?? 0
      const idx = Math.round(el.scrollLeft / (cw + gap))
      setActiveIdx(idx)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // 특정 카드로 스크롤
  function scrollTo(idx: number) {
    const el = containerRef.current
    if (!el) return
    const cw = el.querySelector('div')?.offsetWidth ?? 0
    el.scrollTo({ left: idx * (cw + 12), behavior: 'smooth' })
    setActiveIdx(idx)
  }

  const saveOrder = useCallback(async (ordered: House[]) => {
    setSaving(true)
    await fetch('/api/houses/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ordered.map(h => h.id) }),
    })
    setSaving(false)
  }, [])

  function onTouchStart(idx: number, e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0].clientX
    dragStartX.current = e.touches[0].clientX
    isDragging.current = false
    cardWidth.current = (e.currentTarget as HTMLDivElement).offsetWidth
  }

  function onTouchMove(idx: number, e: React.TouchEvent) {
    const dx = e.touches[0].clientX - touchStartX.current
    if (!isDragging.current && Math.abs(dx) > 8) {
      isDragging.current = true
      setDraggingIdx(idx)
    }
    if (isDragging.current) {
      e.preventDefault()
      setDragOffset(e.touches[0].clientX - dragStartX.current)
    }
  }

  function onTouchEnd(idx: number) {
    if (!isDragging.current) {
      setDraggingIdx(null)
      setDragOffset(0)
      return
    }

    const threshold = cardWidth.current * 0.35
    const next = [...houses]

    if (dragOffset < -threshold && idx > 0) {
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      setHouses(next)
      saveOrder(next)
      scrollTo(idx - 1)
    } else if (dragOffset > threshold && idx < houses.length - 1) {
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      setHouses(next)
      saveOrder(next)
      scrollTo(idx + 1)
    }

    setDraggingIdx(null)
    setDragOffset(0)
    isDragging.current = false
  }

  return (
    <div>
      {saving && (
        <p style={{ fontSize: 11, color: '#60a5fa', textAlign: 'center', padding: '4px 0 6px' }}>순서 저장 중...</p>
      )}

      {/* 가로 스크롤 카드 컨테이너 */}
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: draggingIdx !== null ? 'hidden' : 'auto',
          padding: '4px 16px 4px',
          marginLeft: -16,
          marginRight: -16,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {houses.map((house, idx) => {
          const score = calcHealthScore(house._count.inventories, house._count.histories)
          const scoreColor = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'
          const isDrag = draggingIdx === idx
          const isAdjacent = draggingIdx !== null && Math.abs(idx - draggingIdx) === 1

          return (
            <div
              key={house.id}
              onTouchStart={e => onTouchStart(idx, e)}
              onTouchMove={e => onTouchMove(idx, e)}
              onTouchEnd={() => onTouchEnd(idx)}
              style={{
                flexShrink: 0,
                width: 'calc(85vw)',
                maxWidth: 340,
                scrollSnapAlign: 'start',
                background: 'var(--bg-card)',
                border: isDrag ? '1px solid #60a5fa' : '0.5px solid var(--border)',
                borderRadius: 18,
                overflow: 'hidden',
                transform: isDrag
                  ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.02}deg) scale(1.03)`
                  : isAdjacent && dragOffset !== 0
                  ? `translateX(${dragOffset > 0 && idx === (draggingIdx ?? 0) + 1 ? -8 : dragOffset < 0 && idx === (draggingIdx ?? 0) - 1 ? 8 : 0}px)`
                  : 'none',
                transition: isDrag ? 'none' : 'transform 0.25s ease',
                zIndex: isDrag ? 10 : 1,
                position: 'relative',
                boxShadow: isDrag ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
                touchAction: 'pan-y',
              }}
            >
              {/* 드래그 힌트 */}
              <div style={{ padding: '10px 16px 0', display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 10, color: '#333' }}>← 밀어서 순서 변경 →</span>
              </div>

              <Link href={`/houses/${house.id}`} style={{ display: 'block', padding: '8px 18px 14px', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, background: '#0d1a2e', color: '#60a5fa', padding: '2px 8px', borderRadius: 20, border: '0.5px solid #1e3a5f' }}>
                        {house.houseType}
                      </span>
                      {house.buildYear && <span style={{ fontSize: 11, color: '#555' }}>{house.buildYear}년 건축</span>}
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>{house.address}</p>
                    {house.addressDetail && <p style={{ fontSize: 13, color: '#666' }}>{house.addressDetail}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 22, fontWeight: 500, color: scoreColor }}>{score}</p>
                    <p style={{ fontSize: 10, color: '#555' }}>건강점수</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: '#555' }}>
                    <i className="ti ti-package" style={{ fontSize: 12, marginRight: 4 }} />
                    설비 {house._count.inventories}
                  </span>
                  <span style={{ fontSize: 12, color: '#555' }}>
                    <i className="ti ti-tool" style={{ fontSize: 12, marginRight: 4 }} />
                    이력 {house._count.histories}
                  </span>
                </div>
              </Link>

              <div style={{ borderTop: '0.5px solid #1a1a22', display: 'flex' }}>
                <Link href={`/houses/${house.id}`} style={{ flex: 1, padding: '10px 0', textAlign: 'center', fontSize: 12, color: '#60a5fa', textDecoration: 'none' }}>
                  대시보드 열기
                </Link>
                <div style={{ width: '0.5px', background: '#1a1a22' }} />
                <div style={{ flex: 0 }}>
                  <DeleteHouseButton id={house.id} address={house.address} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 하단 집 선택 버튼 */}
      {houses.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '10px 0 4px' }}>
          {houses.map((house, i) => (
            <button
              key={house.id}
              onClick={() => scrollTo(i)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                opacity: i === activeIdx ? 1 : 0.4,
                transition: 'opacity 0.2s',
              }}
            >
              <div style={{
                width: i === activeIdx ? 24 : 8,
                height: 4,
                borderRadius: 2,
                background: '#60a5fa',
                transition: 'width 0.25s ease',
              }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
