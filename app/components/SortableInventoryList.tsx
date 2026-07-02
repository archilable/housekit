'use client'

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'

interface WarrantyStatus {
  label: string; color: string; bg: string; border: string
}

interface InventoryItem {
  id: string
  name: string
  brand: string | null
  model: string | null
  category: string
  installedAt: Date | null
  warrantyMonths: number | null
  sortOrder: number
  contactName: string | null
  contactPhone: string | null
  contactCompany: string | null
  contactImageBase64: string | null
}

const INVENTORY_ICONS: Record<string, string> = { 보일러: 'ti-flame', 에어컨: 'ti-air-conditioning', 정수기: 'ti-droplet', 냉장고: 'ti-snowflake', 세탁기: 'ti-wash', 도어락: 'ti-lock', 기타: 'ti-package' }
const INVENTORY_COLORS: Record<string, string> = { 보일러: '#f97316', 에어컨: '#60a5fa', 정수기: '#34d399', 냉장고: '#a78bfa', 세탁기: '#38bdf8', 도어락: '#fbbf24', 기타: '#888' }

function getWarrantyStatus(installedAt: Date | null, warrantyMonths: number | null): WarrantyStatus | null {
  if (!installedAt || !warrantyMonths) return null
  const expiry = new Date(installedAt)
  expiry.setMonth(expiry.getMonth() + warrantyMonths)
  const diffDays = Math.ceil((expiry.getTime() - Date.now()) / 86400000)
  if (diffDays < 0) return { label: '보증 만료', color: '#f87171', bg: '#1a0d0d', border: '#3d1a1a' }
  if (diffDays <= 30) return { label: `보증 D-${diffDays}`, color: '#fbbf24', bg: '#1a1200', border: '#3d2e00' }
  return { label: `보증 ${Math.floor(diffDays / 30)}개월`, color: '#34d399', bg: '#0d1f14', border: '#1a3d28' }
}

export default function SortableInventoryList({ initialItems, houseId, highlightId }: { initialItems: InventoryItem[], houseId: string, highlightId?: string }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)

  async function handleDelete(itemId: string, name: string) {
    if (!confirm(`"${name}"을(를) 삭제할까요?`)) return
    await fetch(`/api/inventory/${itemId}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== itemId))
    router.refresh()
  }
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDragging = useRef(false)
  const touchStartY = useRef(0)
  const mouseStartY = useRef(0)
  const draggingIdRef = useRef<string | null>(null)
  const overIdRef = useRef<string | null>(null)
  const itemsRef = useRef(items)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => { itemsRef.current = items }, [items])

  useLayoutEffect(() => {
    if (highlightId) {
      const el = itemRefs.current.get(highlightId)
      if (el) { setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100) }
    }
  }, [highlightId])
  useEffect(() => { draggingIdRef.current = draggingId }, [draggingId])
  useEffect(() => { overIdRef.current = overId }, [overId])

  const saveOrder = useCallback(async (ordered: InventoryItem[]) => {
    setSaving(true)
    await fetch('/api/inventory/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ordered.map(i => i.id) }),
    })
    setSaving(false)
  }, [])

  function applyReorder(fromId: string, toId: string) {
    const current = itemsRef.current
    const from = current.findIndex(i => i.id === fromId)
    const to = current.findIndex(i => i.id === toId)
    if (from !== -1 && to !== -1 && from !== to) {
      const next = [...current]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      setItems(next)
      saveOrder(next)
    }
  }

  // --- Touch ---
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
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
      if (dy > 8 && longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      return
    }
    e.preventDefault()
    const y = e.touches[0].clientY
    for (const [id, el] of itemRefs.current) {
      if (id === draggingId) continue
      const rect = el.getBoundingClientRect()
      if (y >= rect.top && y <= rect.bottom) { setOverId(id); break }
    }
  }

  function onTouchEnd() {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    if (!isDragging.current || !draggingId || !overId) {
      isDragging.current = false; setDraggingId(null); setOverId(null); return
    }
    applyReorder(draggingId, overId)
    isDragging.current = false; setDraggingId(null); setOverId(null)
  }

  // --- Mouse ---
  function onMouseDown(id: string, e: React.MouseEvent) {
    e.preventDefault()
    mouseStartY.current = e.clientY
    longPressTimer.current = setTimeout(() => {
      isDragging.current = true
      setDraggingId(id)
    }, 200)

    function onMouseMove(ev: MouseEvent) {
      if (!isDragging.current) {
        if (Math.abs(ev.clientY - mouseStartY.current) > 5 && longPressTimer.current) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
        return
      }
      const y = ev.clientY
      for (const [rid, el] of itemRefs.current) {
        if (rid === draggingIdRef.current) continue
        const rect = el.getBoundingClientRect()
        if (y >= rect.top && y <= rect.bottom) {
          setOverId(rid)
          overIdRef.current = rid
          break
        }
      }
    }

    function onMouseUp() {
      if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
      if (isDragging.current && draggingIdRef.current && overIdRef.current) {
        applyReorder(draggingIdRef.current, overIdRef.current)
      }
      isDragging.current = false
      setDraggingId(null)
      setOverId(null)
      draggingIdRef.current = null
      overIdRef.current = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, userSelect: 'none' }}>
      {saving && <p style={{ fontSize: 11, color: '#60a5fa', textAlign: 'center', padding: '2px 0' }}>순서 저장 중...</p>}
      {items.map((item) => {
        const w = getWarrantyStatus(item.installedAt, item.warrantyMonths)
        const iconColor = INVENTORY_COLORS[item.category] || '#888'
        const icon = INVENTORY_ICONS[item.category] || 'ti-package'
        const isDrag = draggingId === item.id
        const isOver = overId === item.id
        const isHighlighted = highlightId === item.id

        return (
          <div
            key={item.id}
            ref={el => { if (el) itemRefs.current.set(item.id, el); else itemRefs.current.delete(item.id) }}
            onTouchStart={e => onTouchStart(item.id, e)}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              background: isHighlighted ? '#1a0e00' : 'var(--bg-card)',
              border: isHighlighted ? '1px solid #f97316' : isOver ? '1px solid #3b82f6' : `0.5px solid ${w ? w.border : 'var(--border)'}`,
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: isDrag ? 0.4 : 1,
              transform: isOver ? 'scale(1.02)' : 'scale(1)',
              transition: 'transform 0.15s, opacity 0.15s, border 0.15s',
              touchAction: draggingId ? 'none' : 'auto',
              cursor: isDragging.current ? 'grabbing' : 'default',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: iconColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ti ${icon}`} style={{ fontSize: 18, color: iconColor }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</p>
                {w && <span style={{ fontSize: 10, color: w.color, background: w.bg, padding: '1px 6px', borderRadius: 10, border: `0.5px solid ${w.border}` }}>{w.label}</span>}
              </div>
              {item.brand && <p style={{ fontSize: 12, color: '#666' }}>{item.brand} {item.model}</p>}
              {item.installedAt && <p style={{ fontSize: 11, color: '#444', marginTop: 1 }}>설치 {new Date(item.installedAt).toLocaleDateString('ko-KR')}</p>}
              {(item.contactCompany || item.contactPhone) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                  {item.contactCompany && <span style={{ fontSize: 11, color: '#555' }}>{item.contactCompany}</span>}
                  {item.contactPhone && (
                    <a href={`tel:${item.contactPhone}`} style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <i className="ti ti-phone" style={{ fontSize: 11 }} />{item.contactPhone}
                    </a>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              <a href={`/houses/${houseId}/inventory/${item.id}/edit`} style={{ color: '#60a5fa', fontSize: 18, padding: 4, textDecoration: 'none' }}>
                <i className="ti ti-pencil" />
              </a>
              <button onClick={() => handleDelete(item.id, item.name)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 18, padding: 4, cursor: 'pointer' }}>
                <i className="ti ti-trash" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
