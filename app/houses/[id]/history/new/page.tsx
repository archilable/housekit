import { createHistory } from '@/lib/actions'
import Link from 'next/link'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff',
  outline: 'none', fontFamily: 'inherit',
}
const labelStyle = { fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }

export default async function NewHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/houses/${id}?tab=history`} style={{ color: '#555', textDecoration: 'none', fontSize: 13 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 18, verticalAlign: -3 }} aria-hidden="true" />
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginTop: 12 }}>이력 추가</h1>
      </div>

      <form action={createHistory} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input type="hidden" name="houseId" value={id} />

        <div>
          <label style={labelStyle}>구분 <span style={{ color: '#f87171' }}>*</span></label>
          <select name="category" required style={{ ...inputStyle, appearance: 'none' as const }}>
            <option value="">선택하세요</option>
            <option value="수리">수리</option>
            <option value="교체">교체</option>
            <option value="점검">점검</option>
            <option value="청소">청소</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>제목 <span style={{ color: '#f87171' }}>*</span></label>
          <input name="title" required placeholder="보일러 수리, 누수 점검 등" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>상세 내용</label>
          <textarea name="description" rows={3} placeholder="작업 내용을 자세히 기록하세요" style={{ ...inputStyle, resize: 'none' as const }} />
        </div>

        <div>
          <label style={labelStyle}>작업일 <span style={{ color: '#f87171' }}>*</span></label>
          <input name="doneAt" type="date" required defaultValue={today} style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>업체명</label>
            <input name="company" placeholder="홍길동 보일러" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>비용 (원)</label>
            <input name="cost" type="number" placeholder="150000" min="0" style={inputStyle} />
          </div>
        </div>

        <button type="submit" style={{ marginTop: 8, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
          저장하기
        </button>
      </form>
    </div>
  )
}
