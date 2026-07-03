export default function Loading() {
  return (
    <div style={{ padding: '24px 20px', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div style={{ height: 12, width: 40, background: '#1e1e2e', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 28, width: 120, background: '#1e1e2e', borderRadius: 6, marginBottom: 24 }} />
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ height: 72, background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 16, marginBottom: 10 }} />
      ))}
    </div>
  )
}
