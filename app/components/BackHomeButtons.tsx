'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BackHomeButtons({ houseId }: { houseId: string }) {
  const router = useRouter()
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <Link href={`/houses/${houseId}`} style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
      </Link>
    </div>
  )
}
