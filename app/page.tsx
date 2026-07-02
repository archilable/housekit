import Link from 'next/link'
import { auth } from '@/auth'

export default async function LandingPage() {
  const session = await auth()
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0f', padding: '0 32px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 배경 그라데이션 원 */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)',
        top: '10%', left: '50%', transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)',
        bottom: '15%', left: '50%', transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />

      {/* 로고 SVG */}
      <div style={{ marginBottom: 32 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="72" height="72" rx="20" fill="#0d1a2e" />
          <rect width="72" height="72" rx="20" fill="url(#logoGrad)" opacity="0.5" />
          {/* 집 모양 */}
          <polygon points="36,14 58,32 14,32" fill="#1e3a5f" stroke="#2a4a80" strokeWidth="1" />
          <rect x="16" y="32" width="40" height="24" fill="#111828" stroke="#1e3a5f" strokeWidth="1" />
          {/* 문 */}
          <rect x="30" y="42" width="12" height="14" fill="#0d1a2e" stroke="#1e3a5f" strokeWidth="0.5" rx="1" />
          {/* 창문 */}
          <rect x="19" y="36" width="10" height="8" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
          <rect x="43" y="36" width="10" height="8" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
          {/* 포인트 도트 */}
          <circle cx="36" cy="14" r="2.5" fill="#60a5fa" opacity="0.9" />
          <circle cx="19" cy="40" r="1" fill="#60a5fa" opacity="0.5" />
          <circle cx="53" cy="40" r="1" fill="#60a5fa" opacity="0.5" />
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="72" y2="72">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#0d1a2e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 로고 텍스트 */}
      <div style={{ marginBottom: 12 }}>
        <h1 style={{
          fontSize: 42, fontWeight: 700, letterSpacing: -2,
          background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', lineHeight: 1,
        }}>
          HouseKit
        </h1>
        <p style={{
          fontSize: 13, letterSpacing: 6, color: '#1e3a5f',
          textTransform: 'uppercase', marginTop: 8, fontWeight: 500,
        }}>
          집의 이력서
        </p>
      </div>

      {/* 태그라인 */}
      <p style={{
        fontSize: 15, color: '#555', lineHeight: 1.8, marginBottom: 56,
        maxWidth: 260,
      }}>
        오늘 고친 것도, 10년 후 팔 때도.<br />HouseKit이 기억합니다.
      </p>

      {/* 들어가기 버튼 */}
      <Link href={session ? '/houses' : '/login'} style={{
        display: 'block', width: '100%', maxWidth: 280,
        background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
        color: '#fff', padding: '17px 0', borderRadius: 16,
        fontSize: 16, fontWeight: 600, textDecoration: 'none',
        letterSpacing: 0.5,
        boxShadow: '0 8px 32px rgba(29,78,216,0.35)',
      }}>
        시작하기
      </Link>

      <p style={{ fontSize: 12, color: '#2a2a38', marginTop: 24 }}>
        v0.2 · made with ♥
      </p>
    </div>
  )
}
