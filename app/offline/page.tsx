'use client'

export default function OfflinePage() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', padding: '0 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>🏠</div>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>오프라인 상태예요</h1>
      <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
        인터넷 연결을 확인하고<br />다시 시도해주세요.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 32, background: '#1d4ed8', color: '#fff', border: 'none',
          borderRadius: 12, padding: '14px 32px', fontSize: 15, cursor: 'pointer',
        }}
      >
        다시 시도
      </button>
    </div>
  )
}
