'use client'

import { useState, useRef, useCallback } from 'react'
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
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDragging = useRef(false)
  const touchStartY = useRef(0)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const saveOrder = useCallback(async (ordered: House[]) => {
    setSaving(true)
    await fetch('/api/houses/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ordered.map(h => h.id) }),
    })
    setSaving(false)
  }, [])

  function onTouchStart(id: string, e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
    longPressTimer.current = setTimeout(() => {
      isDragging.current = true
      setDraggingId(id)
      if (navigator.vibrate) navigator.vibrate(40)
    }, 450)
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isDragging.current || !draggingId) {
      // 조금 움직이면 롱프레스 취소
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
      if (dy > 8 && longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      return
    }
    e.preventDefault()

    const y = e.touches[0].clientY
    // 어떤 아이템 위에 있는지 찾기
    for (const [id, el] of itemRefs.current) {
      if (id === draggingId) continue
      const rect = el.getBoundingClientRect()
      if (y >= rect.top && y <= rect.bottom) {
        setOverId(id)
        break
      }
    }
  }

  function onTouchEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    if (!isDragging.current || !draggingId || !overId) {
      isDragging.current = false
      setDraggingId(null)
      setOverId(null)
      return
    }

    // 순서 교체
    const from = houses.findIndex(h => h.id === draggingId)
    const to = houses.findIndex(h => h.id === overId)
    if (from !== -1 && to !== -1 && from !== to) {
      const next = [...houses]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      setHouses(next)
      saveOrder(next)
    }

    isDragging.current = false
    setDraggingId(null)
    setOverId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, userSelect: 'none' }}>
      {saving && (
        <p style={{ fontSize: 11, color: '#60a5fa', textAlign: 'center', padding: '4px 0' }}>순서 저장 중...</p>
      )}
      {houses.map((house) => {
        const score = calcHealthScore(house._count.inventories, house._count.histories)
        const scoreColor = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'
        const isDrag = draggingId === house.id
        const isOver = overId === house.id

        return (
          <div
            key={house.id}
            ref={el => { if (el) itemRefs.current.set(house.id, el); else itemRefs.current.delete(house.id) }}
            onTouchStart={e => onTouchStart(house.id, e)}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              background: 'var(--bg-card)',
              border: isOver ? '1px solid #3b82f6' : isDrag ? '1px solid #60a5fa' : '0.5px solid var(--border)',
              borderRadius: 18,
              overflow: 'hidden',
              opacity: isDrag ? 0.5 : 1,
              transform: isOver ? 'scale(1.02)' : 'scale(1)',
              transition: 'transform 0.15s, border 0.15s, opacity 0.15s',
              touchAction: draggingId ? 'none' : 'auto',
            }}
          >
            {/* 드래그 핸들 힌트 */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 0', gap: 6 }}>
              <i className="ti ti-grip-horizontal" style={{ fontSize: 16, color: '#333', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#333' }}>꾹 눌러서 순서 변경</span>
            </div>

            <Link href={`/houses/${house.id}`} style={{ display: 'block', padding: '10px 18px 14px', textDecoration: 'none', color: 'inherit' }}>
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
  )
}
