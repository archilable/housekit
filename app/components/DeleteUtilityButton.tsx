'use client'
import { useRouter } from 'next/navigation'

export default function DeleteUtilityButton({ utilityId, houseId, month }: { utilityId: string; houseId: string; month: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`${month.replace('-', '년 ')}월 공과금을 삭제할까요?`)) return
    await fetch(`/api/utility/${utilityId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 18, padding: 0, display: 'flex', alignItems: 'center' }}>
      <i className="ti ti-trash" />
    </button>
  )
}
