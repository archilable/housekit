'use client'

import { useState, useRef } from 'react'
import FloorPlanSection from './FloorPlanSection'

export default function FloorPlanButton({ houseId }: { houseId: string }) {
  const [open, setOpen] = useState(false)
  const hasSelectionRef = useRef(false)
  const clearSelectionRef = useRef<(() => void) | null>(null)

  function handleClose() {
    if (hasSelectionRef.current && clearSelectionRef.current) {
      clearSelectionRef.current()
    } else {
      setOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 14, width: '100%',
          background: '#111828', border: '0.5px solid #1e2a3a',
          borderRadius: 12, padding: '11px 0', fontSize: 14, color: '#60a5fa',
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
        }}
      >
        <span style={{ fontSize: 16 }}>📐</span>
        도면 · 설계도 보기
        <span style={{ marginLeft: 'auto', marginRight: 16, fontSize: 12, color: '#333' }}>›</span>
      </button>

      {open && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            paddingBottom: 80,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxHeight: 'calc(100dvh - 80px)', background: '#0a0a0f',
              borderRadius: '20px 20px 0 0', border: '0.5px solid #1e1e28',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* 핸들 */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, background: '#2a2a38', borderRadius: 2 }} />
            </div>
            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 12px', flexShrink: 0 }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>도면 · 설계도</p>
              <button
                onClick={handleClose}
                style={{ background: 'none', border: 'none', color: '#555', fontSize: 22, cursor: 'pointer', padding: 4 }}
              >
                ✕
              </button>
            </div>
            {/* 내용 */}
            <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 16, WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
              <FloorPlanSection
                houseId={houseId}
                onSelectionChange={(has) => { hasSelectionRef.current = has }}
                clearSelectionRef={clearSelectionRef}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
