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
        <svg width="72" height="72" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="96" height="96" rx="22" fill="#0b1220"/>
          <path d="M48,13 L12,43 L12,82 L84,82 L84,43 Z" fill="#2d4f7c" stroke="#4a72a8" strokeWidth="1.8" strokeLinejoin="round"/>
          <circle cx="48" cy="58" r="16" fill="#071a0e" stroke="#34d39933" strokeWidth="1"/>
          <polyline points="39,58 45,65 57,50" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* 로고 텍스트 */}
      <div style={{ marginBottom: 12 }}>
        <h1 style={{
          fontSize: 44, fontWeight: 700, letterSpacing: -2,
          background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', lineHeight: 1,
        }}>
          HouseKit
        </h1>
        <p style={{
          fontSize: 15, letterSpacing: 6, color: '#1e3a5f',
          textTransform: 'uppercase', marginTop: 8, fontWeight: 500,
        }}>
          집의 이력서
        </p>
      </div>

      {/* 태그라인 */}
      <p style={{
        fontSize: 17, color: '#555', lineHeight: 1.8, marginBottom: 56,
        maxWidth: 260,
      }}>
        오늘 고친 것도, 10년 후 팔 때도.<br />HouseKit이 기억합니다.
      </p>

      {/* 들어가기 버튼 */}
      <Link href={session ? '/houses' : '/login'} style={{
        display: 'block', width: '100%', maxWidth: 280,
        background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
        color: '#fff', padding: '17px 0', borderRadius: 16,
        fontSize: 18, fontWeight: 600, textDecoration: 'none',
        letterSpacing: 0.5,
        boxShadow: '0 8px 32px rgba(29,78,216,0.35)',
      }}>
        시작하기
      </Link>

      <p style={{ fontSize: 14, color: '#2a2a38', marginTop: 24 }}>
        v0.2 · made with ♥
      </p>
    </div>
  )
}
