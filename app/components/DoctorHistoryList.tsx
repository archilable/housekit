import { prisma } from '@/lib/db'

function extractSoomgoKeyword(text: string): string {
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('숨고 검색') || lines[i].includes('검색 키워드')) {
      const next = lines[i + 1]?.trim()
      if (next) return next.replace(/^[-*\s]+/, '').trim()
    }
    const m = lines[i].match(/\[([^\]]+)\]\s*$/)
    if (m && i > 0 && lines[i - 1]?.includes('전문가')) return m[1]
  }
  return text.split('\n').find(l => l.trim() && !l.startsWith('#'))?.slice(0, 20) || '수리'
}

function extractMaterials(text: string): string[] {
  const lines = text.split('\n')
  const materials: string[] = []
  let inMaterials = false
  for (const line of lines) {
    if (line.includes('필요한 자재') || line.includes('자재')) inMaterials = true
    else if (line.startsWith('## ')) inMaterials = false
    if (inMaterials && line.trim().startsWith('-')) {
      const mat = line.replace(/^-\s*/, '').split('(')[0].trim()
      if (mat) materials.push(mat)
    }
  }
  return materials
}

export default async function DoctorHistoryList({ houseId }: { houseId: string }) {
  const histories = await prisma.doctorHistory.findMany({
    where: { houseId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  if (histories.length === 0) return null

  return (
    <div style={{ padding: '0 16px', marginTop: 8 }}>
      <p style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>진단 이력</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {histories.map(h => {
          const lines = h.result.split('\n').filter(l => l.trim() && !l.startsWith('##'))
          const summary = lines[0]?.slice(0, 60) || '진단 결과'
          const severity = h.result.match(/\[?(낮음|보통|높음|긴급)\]?/)?.[1]
          const severityColor: Record<string, string> = { 낮음: '#34d399', 보통: '#fbbf24', 높음: '#f97316', 긴급: '#f87171' }
          const dateStr = new Date(h.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          const soomgoKeyword = extractSoomgoKeyword(h.result)
          const materials = extractMaterials(h.result)

          return (
            <details key={h.id} style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 14, overflow: 'hidden' }}>
              <summary style={{ padding: '14px 16px', cursor: 'pointer', listStyle: 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    {severity && (
                      <span style={{ fontSize: 10, color: severityColor[severity] || '#888', background: (severityColor[severity] || '#888') + '22', padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>
                        {severity}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#555' }}>{dateStr}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                    {h.description || summary}
                  </p>
                </div>
                <i className="ti ti-chevron-down" style={{ fontSize: 16, color: '#444', flexShrink: 0, marginTop: 2 }} />
              </summary>

              <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid #1e1e28' }}>
                {h.imageBase64 && (
                  <div style={{ marginBottom: 12, marginTop: 12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/jpeg;base64,${h.imageBase64}`}
                      alt="진단 사진"
                      style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, display: 'block' }}
                    />
                  </div>
                )}

                {/* 진단 결과 텍스트 */}
                <div style={{ marginTop: 12, marginBottom: 16 }}>
                  {h.result.split('\n').map((line, i) => {
                    if (line.includes('숨고 검색') || (i > 0 && h.result.split('\n')[i-1]?.includes('숨고 검색'))) return null
                    if (line.startsWith('## ')) {
                      return <p key={i} style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa', marginTop: 12, marginBottom: 4 }}>{line.replace('## ', '')}</p>
                    }
                    if (!line.trim()) return <br key={i} />
                    return <p key={i} style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, margin: '2px 0', wordBreak: 'keep-all' }}>{line}</p>
                  })}
                </div>

                {/* 쿠팡 자재 링크 */}
                {materials.length > 0 && (
                  <div style={{ background: '#1a0f00', border: '0.5px solid #f9731622', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: '#f97316', marginBottom: 8, fontWeight: 500 }}>🛒 쿠팡에서 자재 바로 구매</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {materials.map((mat, i) => (
                        <a key={i} href={`https://www.coupang.com/np/search?q=${encodeURIComponent(mat)}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', border: '0.5px solid #f9731633', borderRadius: 8, padding: '8px 12px', textDecoration: 'none' }}>
                          <span style={{ fontSize: 12, color: '#ddd' }}>{mat}</span>
                          <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600, flexShrink: 0 }}>쿠팡 →</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* DIY / 전문가 찾기 버튼 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(soomgoKeyword + ' DIY 수리 방법')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#111828', border: '0.5px solid #1e3a5f', borderRadius: 12, padding: '12px 8px', textDecoration: 'none' }}>
                    <span style={{ fontSize: 20 }}>🔧</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>DIY 수리</span>
                    <span style={{ fontSize: 10, color: '#555', textAlign: 'center' }}>유튜브 영상으로 직접 수리</span>
                  </a>
                  <a href={`https://soomgo.com/search/pro?keyword=${encodeURIComponent(soomgoKeyword)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 12, padding: '12px 8px', textDecoration: 'none' }}>
                    <span style={{ fontSize: 20 }}>👷</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>전문가 찾기</span>
                    <span style={{ fontSize: 10, color: '#555', textAlign: 'center' }}>숨고에서 전문가 연결</span>
                  </a>
                </div>
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
