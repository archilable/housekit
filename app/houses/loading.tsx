export default function Loading() {
  return (
    <div style={{ padding: '24px 16px', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div style={{ height: 14, width: 60, background: '#1e1e2e', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 28, width: 140, background: '#1e1e2e', borderRadius: 6, marginBottom: 24 }} />
      <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 24, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ height: 280, background: '#0d1a2e' }} />
        <div style={{ padding: 20 }}>
          <div style={{ height: 18, width: '60%', background: '#1e1e2e', borderRadius: 4, margin: '0 auto 8px' }} />
          <div style={{ height: 14, width: '35%', background: '#1a1a26', borderRadius: 4, margin: '0 auto' }} />
        </div>
        <div style={{ height: 52, background: '#1d4ed840' }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ flex: 1, height: 60, background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 12 }} />
        ))}
      </div>
    </div>
  )
}
