import { prisma } from '@/lib/db'
import Link from 'next/link'
import DeleteHouseButton from './components/DeleteHouseButton'

export const dynamic = 'force-dynamic'

function calcHealthScore(inventoryCount: number, historyCount: number) {
  const base = 40
  const inv = Math.min(inventoryCount * 8, 30)
  const hist = Math.min(historyCount * 6, 30)
  return Math.min(base + inv + hist, 100)
}

export default async function Home() {
  const houses = await prisma.house.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { inventories: true, histories: true } } },
  })

  if (houses.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>
          <svg width="80" height="72" viewBox="0 0 80 72" fill="none">
            <ellipse cx="40" cy="68" rx="28" ry="4" fill="#1a1a2e" />
            <polygon points="40,8 72,34 8,34" fill="#1a2540" stroke="#2a4a80" strokeWidth="1" />
            <rect x="12" y="34" width="56" height="34" fill="#111828" stroke="#1e3a5f" strokeWidth="1" />
            <rect x="20" y="42" width="14" height="12" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
            <rect x="42" y="42" width="14" height="12" fill="#0d1a2e" stroke="#2a4a80" strokeWidth="0.5" rx="1" />
            <rect x="31" y="50" width="8" height="18" fill="#0d1a2e" stroke="#1e3a5f" strokeWidth="0.5" rx="1" />
            <circle cx="40" cy="8" r="3" fill="#60a5fa" opacity="0.8" />
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>집의 이력서를 시작하세요</h1>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 32, lineHeight: 1.6 }}>
          보일러 교체일, 누수 이력, 수리업체까지<br />집의 모든 기록을 한 곳에
        </p>
        <Link href="/houses/new" style={{
          background: '#1d4ed8', color: '#fff', padding: '14px 32px',
          borderRadius: 14, fontSize: 15, fontWeight: 500, textDecoration: 'none',
        }}>
          첫 번째 주택 등록하기
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 16px 0', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>내 자산</p>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>주택 {houses.length}채</h1>
        </div>
        <div style={{ fontSize: 12, color: '#60a5fa', background: '#0d1a2e', padding: '6px 12px', borderRadius: 20, border: '0.5px solid #1e3a5f' }}>
          총 건강점수 {Math.round(houses.reduce((s, h) => s + calcHealthScore(h._count.inventories, h._count.histories), 0) / houses.length)}점
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {houses.map((house) => {
          const score = calcHealthScore(house._count.inventories, house._count.histories)
          const scoreColor = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'
          return (
            <div key={house.id} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
              <Link href={`/houses/${house.id}`} style={{ display: 'block', padding: '18px 18px 14px', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, background: '#0d1a2e', color: '#60a5fa', padding: '2px 8px', borderRadius: 20, border: '0.5px solid #1e3a5f' }}>
                        {house.houseType}
                      </span>
                      {house.buildYear && <span style={{ fontSize: 11, color: '#555' }}>{house.buildYear}년 건축</span>}
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>{house.address}</p>
                    {house.addressDetail && <p style={{ fontSize: 13, color: '#666' }}>{house.addressDetail}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 22, fontWeight: 500, color: scoreColor }}>{score}</p>
                    <p style={{ fontSize: 10, color: '#555' }}>건강점수</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: '#555' }}>
                    <i className="ti ti-package" style={{ fontSize: 12, marginRight: 4 }} aria-hidden="true" />
                    설비 {house._count.inventories}
                  </span>
                  <span style={{ fontSize: 12, color: '#555' }}>
                    <i className="ti ti-tool" style={{ fontSize: 12, marginRight: 4 }} aria-hidden="true" />
                    이력 {house._count.histories}
                  </span>
                </div>
              </Link>

              <div style={{ borderTop: '0.5px solid #1a1a22', display: 'flex' }}>
                <Link href={`/houses/${house.id}`} style={{ flex: 1, padding: '10px 0', textAlign: 'center', fontSize: 12, color: '#60a5fa', textDecoration: 'none' }}>
                  대시보드 열기
                </Link>
                <div style={{ width: '0.5px', background: '#1a1a22' }} />
                <div style={{ flex: 0 }}>
                  <DeleteHouseButton id={house.id} address={house.address} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
