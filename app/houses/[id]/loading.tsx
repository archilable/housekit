export default function Loading() {
  return (
    <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      {/* 헤더 */}
      <div style={{ background: '#0a0f1a', padding: '16px 16px 0' }}>
        <div style={{ height: 12, width: 80, background: '#1e1e2e', borderRadius: 4, marginBottom: 12 }} />
        <div style={{ height: 220, background: '#0d1a2e', borderRadius: 20, marginBottom: 12 }} />
      </div>
      {/* 탭 */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '0.5px solid #1e1e28', padding: '0 16px', marginBottom: 16 }}>
        {['홈','이력','설비','닥터','공과금','시세'].map(t => (
          <div key={t} style={{ flex: 1, padding: '10px 0', textAlign: 'center', fontSize: 13, color: '#222' }}>{t}</div>
        ))}
      </div>
      {/* 콘텐츠 스켈레톤 */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 90, background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 16 }} />
          ))}
        </div>
        {[1,2,3].map(i => (
          <div key={i} style={{ height: 70, background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 14, marginBottom: 10 }} />
        ))}
      </div>
    </div>
  )
}
