import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHousePageData } from '@/lib/houseData'
import InviteButton from '@/app/components/InviteButton'
import BackHomeButtons from '@/app/components/BackHomeButtons'
import HouseDashboardContent from '@/app/components/HouseDashboardContent'

export const revalidate = 60

export default async function HousePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getHousePageData(id)
  if (!data) notFound()

  return (
    <div style={{ color: '#fff', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ padding: '20px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackHomeButtons houseId={id} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href={`/houses/${id}/edit`} style={{ color: '#60a5fa', fontSize: 20, textDecoration: 'none' }}>
            <i className="ti ti-pencil" />
          </Link>
          <InviteButton houseId={id} />
        </div>
      </div>
      <HouseDashboardContent data={data} houseId={id} />
    </div>
  )
}
