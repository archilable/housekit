'use client'
import { deleteUtility } from '@/lib/actions'

export default function DeleteUtilityButton({ utilityId, houseId, month }: { utilityId: string; houseId: string; month: string }) {
  return (
    <form action={async () => {
      if (!confirm(`${month.replace('-', '년 ')}월 공과금을 삭제할까요?`)) return
      await deleteUtility(utilityId, houseId)
    }}>
      <button type="submit" style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18, padding: 0, display: 'flex', alignItems: 'center' }}>
        <i className="ti ti-trash" />
      </button>
    </form>
  )
}
