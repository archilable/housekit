import { prisma } from '@/lib/db'
import BackHomeButtons from '@/app/components/BackHomeButtons'
import NewHistoryForm from '@/app/components/NewHistoryForm'

export const dynamic = 'force-dynamic'

export default async function NewHistoryPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ title?: string; category?: string; inventoryId?: string }>
}) {
  const { id } = await params
  const sp = await searchParams

  const inventories = await prisma.inventory.findMany({
    where: { houseId: id },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, category: true, brand: true },
  })

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <BackHomeButtons houseId={id} />
        <h1 style={{ fontSize: 22, fontWeight: 500, marginTop: 14, marginBottom: 0 }}>이력 추가</h1>
      </div>
      <NewHistoryForm
        houseId={id}
        inventories={inventories}
        defaultTitle={sp.title}
        defaultCategory={sp.category}
        defaultInventoryId={sp.inventoryId}
      />
    </div>
  )
}
