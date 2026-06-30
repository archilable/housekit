import { prisma } from '@/lib/db'

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
          // 진단 결과에서 첫 줄 요약 추출
          const lines = h.result.split('\n').filter(l => l.trim() && !l.startsWith('##'))
          const summary = lines[0]?.slice(0, 60) || '진단 결과'
          const severity = h.result.match(/\[?(낮음|보통|높음|긴급)\]?/)?.[1]
          const severityColor: Record<string, string> = { 낮음: '#34d399', 보통: '#fbbf24', 높음: '#f97316', 긴급: '#f87171' }
          const dateStr = new Date(h.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

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
                    <div style={{ width: '100%', height: 120, background: '#0d1a2e', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-photo" style={{ fontSize: 28, color: '#2a4a80' }} />
                      <span style={{ fontSize: 11, color: '#444', marginLeft: 8 }}>사진 첨부됨</span>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 12 }}>
                  {h.result.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <p key={i} style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa', marginTop: 12, marginBottom: 4 }}>{line.replace('## ', '')}</p>
                    }
                    if (!line.trim()) return <br key={i} />
                    return <p key={i} style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, margin: '2px 0', wordBreak: 'keep-all' }}>{line}</p>
                  })}
                </div>
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
