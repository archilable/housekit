'use client'

import { deleteHouse } from '@/lib/actions'

export default function DeleteHouseButton({ id, address, variant }: { id: string; address: string; variant?: 'inline' | 'full' }) {
  const handleClick = (e: React.MouseEvent) => {
    if (!confirm(`"${address}" 주택을 삭제할까요?\n모든 이력과 설비 데이터가 함께 삭제됩니다.`)) e.preventDefault()
  }

  if (variant === 'full') {
    return (
      <form action={deleteHouse.bind(null, id)} style={{ marginTop: 40, paddingTop: 24, borderTop: '0.5px solid #1e1e28' }}>
        <button type="submit" onClick={handleClick} style={{
          width: '100%', background: 'transparent', border: '0.5px solid #7f1d1d',
          borderRadius: 10, padding: '13px 0', fontSize: 16, color: '#f87171',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          이 집 삭제하기
        </button>
      </form>
    )
  }

  return (
    <form action={deleteHouse.bind(null, id)}>
      <button type="submit" onClick={handleClick} style={{ width: '100%', padding: '10px 20px', fontSize: 14, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
        삭제
      </button>
    </form>
  )
}
