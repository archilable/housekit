'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BackHomeButtons() {
  const router = useRouter()
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
        <i className="ti ti-chevron-left" style={{ fontSize: 26 }} aria-hidden="true" />
      </button>
      <Link href="/houses" style={{ color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <i className="ti ti-home" style={{ fontSize: 24 }} aria-hidden="true" />
      </Link>
    </div>
  )
}
