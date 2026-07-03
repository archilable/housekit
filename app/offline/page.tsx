'use client'

export default function OfflinePage() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', padding: '0 24px', textAlign: 'center',
    }}>
      <div style={{ marginBottom: 24 }}>
        <svg width="72" height="72" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="96" height="96" rx="22" fill="#0b1220"/>
          <path d="M48,13 L12,43 L12,82 L84,82 L84,43 Z" fill="#2d4f7c" stroke="#4a72a8" strokeWidth="1.8" strokeLinejoin="round"/>
          <circle cx="48" cy="58" r="16" fill="#071a0e" stroke="#34d39933" strokeWidth="1"/>
          <polyline points="39,58 45,65 57,50" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 style={{ fontSize: 23, fontWeight: 600, marginBottom: 12 }}>오프라인 상태예요</h1>
      <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
        인터넷 연결을 확인하고<br />다시 시도해주세요.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 32, background: '#1d4ed8', color: '#fff', border: 'none',
          borderRadius: 12, padding: '14px 32px', fontSize: 16, cursor: 'pointer',
        }}
      >
        다시 시도
      </button>
    </div>
  )
}
