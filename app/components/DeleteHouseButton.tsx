'use client'

import { deleteHouse } from '@/lib/actions'

export default function DeleteHouseButton({ id, address }: { id: string; address: string }) {
  return (
    <form action={deleteHouse.bind(null, id)}>
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`"${address}" 주택을 삭제할까요?\n모든 데이터가 삭제됩니다.`)) e.preventDefault()
        }}
        style={{ width: '100%', padding: '10px 20px', fontSize: 15, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        삭제
      </button>
    </form>
  )
}
