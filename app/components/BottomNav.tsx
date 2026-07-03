'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      maxWidth: 430, margin: '0 auto',
      background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
      borderTop: '0.5px solid #1e1e28',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 0 20px',
      zIndex: 100,
      boxSizing: 'border-box',
      width: '100%',
    }}>
      {[
        { href: '/houses', icon: 'ti-home-2', label: '홈' },
        { href: '/houses/new', icon: 'ti-plus', label: '등록' },
        { href: '/notifications', icon: 'ti-bell', label: '알림' },
        { href: '/analytics', icon: 'ti-chart-bar', label: '분석' },
        { href: '/profile', icon: 'ti-user-circle', label: '내 정보' },
      ].map(({ href, icon, label }) => (
        <Link key={label} href={href} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 3, textDecoration: 'none',
          color: isActive(href) ? '#60a5fa' : '#555',
        }}>
          <i className={`ti ${icon}`} style={{ fontSize: 23 }} aria-hidden="true" />
          <span style={{ fontSize: 11 }}>{label}</span>
        </Link>
      ))}
    </nav>
  )
}
