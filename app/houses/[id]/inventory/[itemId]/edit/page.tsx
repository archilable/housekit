import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import BackHomeButtons from '@/app/components/BackHomeButtons'
import InventoryForm from '@/app/components/InventoryForm'

export default async function EditInventoryPage({ params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { id, itemId } = await params
  const item = await prisma.inventory.findUnique({ where: { id: itemId } })
  if (!item) notFound()

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <BackHomeButtons houseId={id} />
        <h1 style={{ fontSize: 22, fontWeight: 500, marginTop: 14, marginBottom: 0 }}>설비 수정</h1>
      </div>
      <InventoryForm
        houseId={id}
        inventoryId={itemId}
        defaultValues={{
          category: item.category,
          name: item.name,
          brand: item.brand ?? '',
          model: item.model ?? '',
          installedAt: item.installedAt ? new Date(item.installedAt).toISOString().split('T')[0] : '',
          warrantyMonths: item.warrantyMonths ?? null,
          notes: item.notes ?? null,
          contactName: item.contactName ?? null,
          contactPhone: item.contactPhone ?? null,
          contactCompany: item.contactCompany ?? null,
          contactImageBase64: item.contactImageBase64 ?? null,
        }}
      />
    </div>
  )
}
