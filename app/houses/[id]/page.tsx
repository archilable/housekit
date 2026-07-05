import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHousePageData } from '@/lib/houseData'
import { Suspense } from 'react'
import InviteButton from '@/app/components/InviteButton'
import BackHomeButtons from '@/app/components/BackHomeButtons'
import HouseDashboardContent from '@/app/components/HouseDashboardContent'

export const revalidate = 600 // 10분 캐시 — 저장/삭제 시 revalidatePath로 수동 갱신

async function HouseBody({ id }: { id: string }) {
  const data = await getHousePageData(id)
  if (!data) notFound()
  return <HouseDashboardContent data={data} houseId={id} />
}

function HouseSkeleton() {
  return (
    <div style={{ padding: '24px 16px' }}>
      {/* 집 일러스트 스켈레톤 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 120, height: 100, borderRadius: 16, background: '#1a1a24', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: 180, height: 22, borderRadius: 8, background: '#1a1a24', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: 120, height: 16, borderRadius: 8, background: '#111118', animation: 'pulse 1.5s infinite' }} />
      </div>
      {/* 탭 스켈레톤 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24, borderBottom: '0.5px solid #1e1e28', paddingBottom: 12 }}>
        {[60, 40, 50, 50, 60, 40].map((w, i) => (
          <div key={i} style={{ width: w, height: 16, borderRadius: 6, background: '#1a1a24', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      {/* 카드 스켈레톤 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ height: 100, borderRadius: 14, background: '#111118', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      <div style={{ height: 120, borderRadius: 14, background: '#111118', animation: 'pulse 1.5s infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
    </div>
  )
}

export default async function HousePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div style={{ color: '#fff', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ padding: '20px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackHomeButtons houseId={id} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href={`/houses/${id}/edit`} style={{ color: '#60a5fa', fontSize: 20, textDecoration: 'none' }}>
            <i className="ti ti-pencil" />
          </Link>
          <InviteButton houseId={id} />
        </div>
      </div>
      <Suspense fallback={<HouseSkeleton />}>
        <HouseBody id={id} />
      </Suspense>
    </div>
  )
}
