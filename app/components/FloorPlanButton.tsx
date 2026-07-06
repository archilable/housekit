'use client'

import { useState } from 'react'
import FloorPlanSection from './FloorPlanSection'

export default function FloorPlanButton({ houseId }: { houseId: string }) {
  const [open, setOpen] = useState(false)

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
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            zIndex: 1000, display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxHeight: '90vh', background: '#0a0a0f',
              borderRadius: '20px 20px 0 0', border: '0.5px solid #1e1e28',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* 핸들 */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, background: '#2a2a38', borderRadius: 2 }} />
            </div>
            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 12px' }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>도면 · 설계도</p>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: '#555', fontSize: 22, cursor: 'pointer', padding: 4 }}
              >
                ✕
              </button>
            </div>
            {/* 내용 */}
            <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 32 }}>
              <FloorPlanSection houseId={houseId} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
