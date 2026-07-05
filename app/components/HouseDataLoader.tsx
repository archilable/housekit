'use client'

import { useEffect, useState } from 'react'
import HouseDashboardContent from './HouseDashboardContent'

const CACHE_TTL = 60 * 1000 // 1분

function getCached(houseId: string) {
  try {
    const raw = sessionStorage.getItem(`house-data-${houseId}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCache(houseId: string, data: any) {
  try { sessionStorage.setItem(`house-data-${houseId}`, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

export function clearHouseCache(houseId: string) {
  try { sessionStorage.removeItem(`house-data-${houseId}`) } catch {}
}

export default function HouseDataLoader({ houseId }: { houseId: string }) {
  const [data, setData] = useState<any>(() => {
    // If URL has ?refresh=1, skip cache (coming back from a save/delete action)
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('refresh') === '1') return null
    return getCached(houseId)
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const isRefresh = params.get('refresh') === '1'
    if (isRefresh) {
      // Clear cache and remove ?refresh from URL without reloading
      try { sessionStorage.removeItem(`house-data-${houseId}`) } catch {}
      const url = new URL(window.location.href)
      url.searchParams.delete('refresh')
      window.history.replaceState({}, '', url.toString())
    }

    const cached = getCached(houseId)
    if (cached && data && !isRefresh) return // already rendered from cache, skip fetch until TTL expires

    fetch(`/api/houses/${houseId}/data`)
      .then(r => r.json())
      .then(fresh => {
        if (fresh?.house) {
          setCache(houseId, fresh)
          setData(fresh)
        }
      })
      .catch(() => {})
  }, [houseId])

  if (!data) {
    return (
      <div style={{ padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1a1a24', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: 200, height: 20, borderRadius: 8, background: '#1a1a24' }} />
        <div style={{ width: 140, height: 16, borderRadius: 8, background: '#111118' }} />
        <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
      </div>
    )
  }

  return <HouseDashboardContent data={data} houseId={houseId} />
}
