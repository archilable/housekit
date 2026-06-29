import { createHouse } from '@/lib/actions'
import Link from 'next/link'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff',
  outline: 'none', fontFamily: 'inherit',
}
const labelStyle = { fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }

export default function NewHousePage() {
  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 13 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 18, verticalAlign: -3 }} aria-hidden="true" />
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginTop: 12 }}>주택 등록</h1>
        <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>집의 이력서를 시작하세요</p>
      </div>

      <form action={createHouse} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>주소 <span style={{ color: '#f87171' }}>*</span></label>
          <input name="address" required placeholder="서울시 마포구 합정동 123-45" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>상세 주소</label>
          <input name="addressDetail" placeholder="1층, 빌라 A동 101호 등" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>주택 유형 <span style={{ color: '#f87171' }}>*</span></label>
          <select name="houseType" required style={{ ...inputStyle, appearance: 'none' as const }}>
            <option value="">선택하세요</option>
            <option value="단독주택">단독주택</option>
            <option value="빌라/연립">빌라 / 연립</option>
            <option value="다가구">다가구</option>
            <option value="아파트">아파트</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>건축연도</label>
            <input name="buildYear" type="number" placeholder="2005" min="1900" max={new Date().getFullYear()} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>면적 (㎡)</label>
            <input name="area" type="number" placeholder="84.5" step="0.1" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>소유자 이름</label>
          <input name="ownerName" placeholder="홍길동" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>메모</label>
          <textarea name="notes" rows={3} placeholder="추가 정보를 입력하세요" style={{ ...inputStyle, resize: 'none' as const }} />
        </div>

        <button type="submit" style={{ marginTop: 8, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
          등록하기
        </button>
      </form>
    </div>
  )
}
