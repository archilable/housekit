import { upsertUtility } from '@/lib/actions'
import { prisma } from '@/lib/db'
import BackHomeButtons from '@/app/components/BackHomeButtons'
import UtilityForm from './UtilityForm'

function getMonthOptions() {
  const months = []
  const d = new Date()
  for (let i = 0; i < 24; i++) {
    months.push(d.toISOString().slice(0, 7))
    d.setMonth(d.getMonth() - 1)
  }
  return months
}

export default async function NewUtilityPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ month?: string }>
}) {
  const { id } = await params
  const { month: qMonth } = await searchParams
  const thisMonth = new Date().toISOString().slice(0, 7)
  const selectedMonth = qMonth || thisMonth

  const existing = await prisma.utility.findUnique({ where: { houseId_month: { houseId: id, month: selectedMonth } } })
  const months = getMonthOptions()

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <BackHomeButtons houseId={id} />
        <h1 style={{ fontSize: 23, fontWeight: 500, marginTop: 14, marginBottom: 0 }}>공과금 입력</h1>
        <p style={{ fontSize: 16, color: '#555', marginTop: 6 }}>고지서 사진을 찍으면 AI가 자동으로 입력해드려요</p>
      </div>

      <UtilityForm
        houseId={id}
        selectedMonth={selectedMonth}
        months={months}
        existing={existing as Record<string, number | null> | null}
        action={upsertUtility}
      />
    </div>
  )
}
