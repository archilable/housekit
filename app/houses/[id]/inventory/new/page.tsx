import { createInventory } from '@/lib/actions'
import Link from 'next/link'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff',
  outline: 'none', fontFamily: 'inherit',
}
const labelStyle = { fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }

export default async function NewInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/houses/${id}?tab=inventory`} style={{ color: '#555', textDecoration: 'none', fontSize: 13 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 18, verticalAlign: -3 }} aria-hidden="true" />
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginTop: 12 }}>설비 추가</h1>
      </div>

      <form action={createInventory} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input type="hidden" name="houseId" value={id} />

        <div>
          <label style={labelStyle}>카테고리 <span style={{ color: '#f87171' }}>*</span></label>
          <select name="category" required style={{ ...inputStyle, appearance: 'none' as const }}>
            <option value="">선택하세요</option>
            <option value="보일러">보일러</option>
            <option value="에어컨">에어컨</option>
            <option value="정수기">정수기</option>
            <option value="냉장고">냉장고</option>
            <option value="세탁기">세탁기</option>
            <option value="도어락">도어락</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>설비명 <span style={{ color: '#f87171' }}>*</span></label>
          <input name="name" required placeholder="거실 에어컨" style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>브랜드</label>
            <input name="brand" placeholder="삼성, LG 등" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>모델명</label>
            <input name="model" placeholder="AF17TX700HFH" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>설치일</label>
            <input name="installedAt" type="date" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>보증기간 (개월)</label>
            <input name="warrantyMonths" type="number" placeholder="24" min="1" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>메모</label>
          <textarea name="notes" rows={2} placeholder="추가 정보" style={{ ...inputStyle, resize: 'none' as const }} />
        </div>

        <button type="submit" style={{ marginTop: 8, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
          추가하기
        </button>
      </form>
    </div>
  )
}
