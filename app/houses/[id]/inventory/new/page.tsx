import BackHomeButtons from '@/app/components/BackHomeButtons'
import InventoryForm from '@/app/components/InventoryForm'

export default async function NewInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <BackHomeButtons houseId={id} />
        <h1 style={{ fontSize: 22, fontWeight: 500, marginTop: 14, marginBottom: 0 }}>설비 추가</h1>
      </div>
      <InventoryForm houseId={id} />
    </div>
  )
}
