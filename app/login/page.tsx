import Link from 'next/link'
import { signIn } from '@/auth'

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0f', padding: '0 32px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 배경 그라데이션 */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,78,216,0.10) 0%, transparent 70%)',
        top: '10%', left: '50%', transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />

      {/* 로고 */}
      <div style={{ marginBottom: 32 }}>
        <svg width="72" height="72" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="96" height="96" rx="22" fill="#0b1220"/>
          <path d="M48,13 L12,43 L12,82 L84,82 L84,43 Z" fill="#2d4f7c" stroke="#4a72a8" strokeWidth="1.8" strokeLinejoin="round"/>
          <circle cx="48" cy="58" r="16" fill="#071a0e" stroke="#34d39933" strokeWidth="1"/>
          <polyline points="39,58 45,65 57,50" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 style={{
        fontSize: 32, fontWeight: 700, letterSpacing: -1,
        background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', marginBottom: 8,
      }}>
        HouseKit
      </h1>
      <p style={{ fontSize: 13, color: '#444', marginBottom: 48 }}>
        오늘 고친 것도, 10년 후 팔 때도.<br />HouseKit이 기억합니다.
      </p>

      <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 구글 로그인 */}
        <form action={async () => { 'use server'; await signIn('google', { redirectTo: '/houses' }) }} style={{ width: '100%' }}>
          <button type="submit" style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            background: '#fff', color: '#111', border: 'none', borderRadius: 14,
            padding: '15px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            boxSizing: 'border-box',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 시작하기
          </button>
        </form>

        {/* 카카오 로그인 */}
        <form action={async () => { 'use server'; await signIn('kakao', { redirectTo: '/houses' }) }} style={{ width: '100%' }}>
          <button type="submit" style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            background: '#FEE500', color: '#191919', border: 'none', borderRadius: 14,
            padding: '15px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            boxSizing: 'border-box',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.632 1.553 4.95 3.9 6.364l-.995 3.716a.375.375 0 0 0 .545.415L9.85 18.54A11.1 11.1 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
            </svg>
            카카오로 시작하기
          </button>
        </form>
      </div>

      <p style={{ fontSize: 11, color: '#2a2a38', marginTop: 40 }}>
        로그인 시 서비스 이용약관에 동의하게 됩니다
      </p>
    </div>
  )
}
