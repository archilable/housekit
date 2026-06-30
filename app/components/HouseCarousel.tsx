'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import HouseIllustration from './HouseIllustration'

interface House {
  id: string
  address: string
  addressDetail: string | null
  houseType: string
  buildYear: number | null
  area: number | null
  sortOrder: number
  _count: { inventories: number; histories: number }
}

function calcHealthScore(inv: number, hist: number) {
  return Math.min(40 + Math.min(inv * 8, 30) + Math.min(hist * 6, 30), 100)
}

export default function HouseCarousel({ houses }: { houses: House[] }) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isDragging = useRef(false)

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isDragging.current = true
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!isDragging.current) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) > 50 && dy < 60) {
      if (dx < 0) setCurrent(c => (c + 1) % houses.length)
      if (dx > 0) setCurrent(c => (c - 1 + houses.length) % houses.length)
    }
    isDragging.current = false
  }

  const house = houses[current]
  const score = calcHealthScore(house._count.inventories, house._count.histories)
  const scoreColor = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'

  return (
    <div style={{ width: '100%' }}>
      {/* 슬라이드 영역 */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ width: '100%', touchAction: 'pan-y', userSelect: 'none' }}
      >
        {/* 메인 카드 */}
        <div style={{
          background: 'linear-gradient(160deg, #0d1a2e 0%, #111828 60%, #0a0f1a 100%)',
          border: '0.5px solid #1e3a5f',
          borderRadius: 24, overflow: 'hidden',
          marginBottom: 16,
        }}>
          {/* 상단 — 주택 정보 */}
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

          {/* 일러스트 */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
            <HouseIllustration houseType={house.houseType} />
          </div>

          {/* 주소 */}
          <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{house.address}</p>
            {house.addressDetail && <p style={{ fontSize: 13, color: '#555' }}>{house.addressDetail}</p>}

            {/* 미니 스탯 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#60a5fa' }}>{house._count.inventories}</p>
                <p style={{ fontSize: 11, color: '#555' }}>설비</p>
              </div>
              <div style={{ width: 1, background: '#1e1e28' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#a78bfa' }}>{house._count.histories}</p>
                <p style={{ fontSize: 11, color: '#555' }}>이력</p>
              </div>
              {house.area && (
                <>
                  <div style={{ width: 1, background: '#1e1e28' }} />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 600, color: '#34d399' }}>{house.area}</p>
                    <p style={{ fontSize: 11, color: '#555' }}>㎡</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 대시보드 버튼 */}
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
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

      {/* 스와이프 힌트 (집이 2채 이상일 때) */}
      {houses.length > 1 && (
        <p style={{ textAlign: 'center', fontSize: 11, color: '#2a2a38', marginBottom: 16 }}>
          ← 좌우로 밀어서 다른 집 보기 →
        </p>
      )}

      {/* 집 목록 미니 섬네일 */}
      {houses.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {houses.map((h, i) => (
            <button
              key={h.id}
              onClick={() => setCurrent(i)}
              style={{
                flexShrink: 0,
                background: i === current ? '#0d1a2e' : '#111118',
                border: i === current ? '1px solid #3b82f6' : '0.5px solid #1e1e28',
                borderRadius: 12, padding: '10px 14px', cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.2s', minWidth: 120,
              }}
            >
              <p style={{ fontSize: 11, color: i === current ? '#60a5fa' : '#555', marginBottom: 3 }}>{h.houseType}</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: i === current ? '#fff' : '#888',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
                {h.address.replace(/^[가-힣]+(특별시|광역시|도|특별자치시|특별자치도)\s*/, '').split(' ').slice(0, 2).join(' ')}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
