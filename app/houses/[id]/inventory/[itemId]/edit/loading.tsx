export default function Loading() {
  return (
    <div style={{ padding: '20px 16px', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div style={{ height: 14, width: 60, background: '#1e1e2e', borderRadius: 4, marginBottom: 16 }} />
      <div style={{ height: 26, width: 100, background: '#1e1e2e', borderRadius: 6, marginBottom: 28 }} />
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ marginBottom: 18 }}>
          <div style={{ height: 12, width: 60, background: '#1e1e2e', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 48, background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 10 }} />
        </div>
      ))}
      <div style={{ height: 52, background: '#1d4ed844', borderRadius: 14, marginTop: 8 }} />
    </div>
  )
}
