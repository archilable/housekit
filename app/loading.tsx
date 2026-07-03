export default function Loading() {
  return (
    <div style={{ padding: '24px 16px', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div style={{ height: 14, width: 60, background: '#1e1e2e', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 28, width: 160, background: '#1e1e2e', borderRadius: 6, marginBottom: 24 }} />
      {[1,2,3].map(i => (
        <div key={i} style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ height: 160, background: '#1a1a28', borderRadius: 12, marginBottom: 16 }} />
          <div style={{ height: 14, width: '70%', background: '#1e1e2e', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 12, width: '40%', background: '#1a1a26', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  )
}
