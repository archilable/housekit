'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import HouseIllustration from './HouseIllustration'

interface House {
  id: string
  address: string
  addressDetail: string | null
  houseType: string
  buildYear: number | null
  area: number | null
  exclusiveArea: number | null
  sortOrder: number
  _count: { inventories: number; histories: number }
}

function calcHealthScore(inv: number, hist: number) {
  return Math.min(40 + Math.min(inv * 8, 30) + Math.min(hist * 6, 30), 100)
}

export default function HouseCarousel({ houses: initialHouses }: { houses: House[] }) {
  const [houses, setHouses] = useState(initialHouses)
  const [current, setCurrent] = useState(0)
  const [saving, setSaving] = useState(false)

  // 메인 카드 스와이프
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const mainDragging = useRef(false)

  // 썸네일 드래그 순서 변경
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOffsetX, setDragOffsetX] = useState(0)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const thumbTouchStartX = useRef(0)
  const thumbDragStartX = useRef(0)
  const thumbDragging = useRef(false)
  const thumbWidth = useRef(0)

  const saveOrder = useCallback(async (ordered: House[]) => {
    setSaving(true)
    await fetch('/api/houses/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ordered.map(h => h.id) }),
    })
    setSaving(false)
  }, [])

  // 메인 카드 스와이프
  function onMainTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    mainDragging.current = true
  }

  function onMainTouchEnd(e: React.TouchEvent) {
    if (!mainDragging.current) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) > 50 && dy < 60) {
      if (dx < 0) setCurrent(c => (c + 1) % houses.length)
      if (dx > 0) setCurrent(c => (c - 1 + houses.length) % houses.length)
    }
    mainDragging.current = false
  }

  // 썸네일 꾹 누르기 시작
  function onThumbTouchStart(idx: number, e: React.TouchEvent<HTMLButtonElement>) {
    thumbTouchStartX.current = e.touches[0].clientX
    thumbDragStartX.current = e.touches[0].clientX
    thumbDragging.current = false
    thumbWidth.current = (e.currentTarget as HTMLButtonElement).offsetWidth

    longPressTimer.current = setTimeout(() => {
      setDragIdx(idx)
      thumbDragging.current = true
      // 햅틱 피드백 (지원 시)
      if (navigator.vibrate) navigator.vibrate(30)
    }, 400)
  }

  function onThumbTouchMove(idx: number, e: React.TouchEvent) {
    const dx = Math.abs(e.touches[0].clientX - thumbTouchStartX.current)

    // 많이 움직이면 롱프레스 취소
    if (!thumbDragging.current && dx > 8) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
    }

    if (thumbDragging.current) {
      e.preventDefault()
      setDragOffsetX(e.touches[0].clientX - thumbDragStartX.current)
    }
  }

  function onThumbTouchEnd(idx: number) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)

    if (!thumbDragging.current) {
      // 일반 탭 → 해당 집 선택
      setCurrent(idx)
      setDragIdx(null)
      setDragOffsetX(0)
      return
    }

    const threshold = thumbWidth.current * 0.5
    const next = [...houses]
    let nextCurrent = current

    if (dragOffsetX < -threshold && idx > 0) {
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      if (current === idx) nextCurrent = idx - 1
      else if (current === idx - 1) nextCurrent = idx
    } else if (dragOffsetX > threshold && idx < houses.length - 1) {
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      if (current === idx) nextCurrent = idx + 1
      else if (current === idx + 1) nextCurrent = idx
    }

    setHouses(next)
    setCurrent(nextCurrent)
    saveOrder(next)
    setDragIdx(null)
    setDragOffsetX(0)
    thumbDragging.current = false
  }

  const house = houses[current]
  const score = calcHealthScore(house._count.inventories, house._count.histories)
  const scoreColor = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'

  return (
    <div style={{ width: '100%' }}>
      {/* 슬라이드 영역 */}
      <div
        onTouchStart={onMainTouchStart}
        onTouchEnd={onMainTouchEnd}
        style={{ width: '100%', touchAction: 'pan-y', userSelect: 'none' }}
      >
        {/* 메인 카드 */}
        <div style={{
          background: 'linear-gradient(160deg, #0d1a2e 0%, #111828 60%, #0a0f1a 100%)',
          border: '0.5px solid #1e3a5f',
          borderRadius: 24, overflow: 'hidden',
          marginBottom: 16,
        }}>
          <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 11, background: '#1e3a5f', color: '#60a5fa', padding: '3px 10px', borderRadius: 20, border: '0.5px solid #2a4a80' }}>
                {house.houseType}
              </span>
              {house.buildYear && (
                <span style={{ fontSize: 11, color: '#444', marginLeft: 8 }}>{house.buildYear}년</span>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{score}</p>
              <p style={{ fontSize: 10, color: '#555', marginTop: 2 }}>건강점수</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
            <HouseIllustration houseType={house.houseType} />
          </div>

          <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{house.address}</p>
            {house.addressDetail && <p style={{ fontSize: 13, color: '#555' }}>{house.addressDetail}</p>}

            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#a78bfa' }}>{house._count.histories}</p>
                <p style={{ fontSize: 11, color: '#555' }}>이력</p>
              </div>
              <div style={{ width: 1, background: '#1e1e28' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#60a5fa' }}>{house._count.inventories}</p>
                <p style={{ fontSize: 11, color: '#555' }}>설비</p>
              </div>
              {(house.exclusiveArea ?? house.area) && (
                <>
                  <div style={{ width: 1, background: '#1e1e28' }} />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 600, color: '#34d399' }}>{house.exclusiveArea ?? house.area}</p>
                    <p style={{ fontSize: 11, color: '#555' }}>㎡</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <Link href={`/houses/${house.id}`} style={{
            display: 'block', background: '#1d4ed8',
            padding: '15px', textAlign: 'center',
            fontSize: 15, fontWeight: 600, color: '#fff', textDecoration: 'none',
            letterSpacing: 0.3,
          }}>
            대시보드 열기 →
          </Link>
        </div>
      </div>

      {/* 페이지 인디케이터 */}
      {houses.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {houses.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 20 : 6,
                height: 6, borderRadius: 3,
                background: i === current ? '#60a5fa' : '#1e1e28',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.25s',
              }}
            />
          ))}
        </div>
      )}

      {/* 스와이프 힌트 */}
      {houses.length > 1 && (
        <p style={{ textAlign: 'center', fontSize: 11, color: '#2a2a38', marginBottom: 12 }}>
          ← 좌우로 밀어서 다른 집 보기 →
        </p>
      )}

      {/* 집 목록 썸네일 — 꾹 누르고 드래그로 순서 변경 */}
      {houses.length > 1 && (
        <>
          {saving && <p style={{ fontSize: 10, color: '#60a5fa', textAlign: 'center', marginBottom: 4 }}>순서 저장 중...</p>}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, position: 'relative' }}>
            {houses.map((h, i) => {
              const isDrag = dragIdx === i
              const isAdj = dragIdx !== null && Math.abs(i - dragIdx) === 1

              return (
                <button
                  key={h.id}
                  onTouchStart={e => onThumbTouchStart(i, e)}
                  onTouchMove={e => onThumbTouchMove(i, e)}
                  onTouchEnd={() => onThumbTouchEnd(i)}
                  style={{
                    flexShrink: 0,
                    background: i === current ? '#0d1a2e' : '#111118',
                    border: isDrag
                      ? '1px solid #60a5fa'
                      : i === current
                      ? '1px solid #3b82f6'
                      : '0.5px solid #1e1e28',
                    borderRadius: 12, padding: '10px 14px', cursor: 'pointer',
                    textAlign: 'left', minWidth: 120,
                    transform: isDrag
                      ? `translateX(${dragOffsetX}px) scale(1.05)`
                      : isAdj && dragOffsetX !== 0
                      ? `translateX(${dragOffsetX > 0 && i === (dragIdx ?? 0) + 1 ? -6 : dragOffsetX < 0 && i === (dragIdx ?? 0) - 1 ? 6 : 0}px)`
                      : 'none',
                    transition: isDrag ? 'none' : 'transform 0.2s ease, border 0.2s',
                    zIndex: isDrag ? 10 : 1,
                    position: 'relative',
                    boxShadow: isDrag ? '0 4px 16px rgba(96,165,250,0.3)' : 'none',
                    touchAction: 'pan-x',
                  }}
                >
                  <p style={{ fontSize: 11, color: i === current ? '#60a5fa' : '#555', marginBottom: 3 }}>{h.houseType}</p>
                  <p style={{
                    fontSize: 12, fontWeight: 500, color: i === current ? '#fff' : '#888',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110,
                  }}>
                    {h.address.replace(/^[가-힣]+(특별시|광역시|도|특별자치시|특별자치도)\s*/, '').split(' ').slice(0, 2).join(' ')}
                  </p>
                  {isDrag && (
                    <p style={{ fontSize: 9, color: '#60a5fa', marginTop: 3 }}>← 드래그 →</p>
                  )}
                </button>
              )
            })}
          </div>
          <p style={{ fontSize: 10, color: '#1e1e28', textAlign: 'center', marginTop: 6 }}>꾹 누르고 드래그하면 순서 변경</p>
        </>
      )}
    </div>
  )
}
