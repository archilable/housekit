import SubmitButton from '@/app/components/SubmitButton'
import { createHouse } from '@/lib/actions'
import Link from 'next/link'
import AddressSearch from '@/app/components/AddressSearch'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 17, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
  display: 'block' as const,
}
const labelStyle = { fontSize: 14, color: '#888', display: 'block', marginBottom: 8 }
const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i)

export default function NewHousePage() {
  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <Link href="/houses" style={{ color: '#555', textDecoration: 'none', fontSize: 15 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 22, verticalAlign: -3 }} aria-hidden="true" />
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 500, marginTop: 14, marginBottom: 4 }}>주택 등록</h1>
        <p style={{ fontSize: 15, color: '#666' }}>집의 이력서를 시작하세요</p>
      </div>

      <form action={createHouse} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>주소 <span style={{ color: '#f87171' }}>*</span></label>
          <AddressSearch />
        </div>

        <div style={fieldStyle}>
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

        <div style={fieldStyle}>
          <label style={labelStyle}>건축연도</label>
          <select name="buildYear" style={{ ...inputStyle, appearance: 'none' as const }}>
            <option value="">선택하세요</option>
            {years.map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>대지면적 (㎡)</label>
          <input name="landArea" type="number" placeholder="120.0" step="0.1" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>건축면적 (㎡)</label>
          <input name="buildArea" type="number" placeholder="84.5" step="0.1" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>전용면적 / 실면적 (㎡)</label>
          <input name="exclusiveArea" type="number" placeholder="59.9" step="0.1" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>소유자 이름</label>
          <input name="ownerName" placeholder="홍길동" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>메모</label>
          <textarea name="notes" rows={3} placeholder="추가 정보를 입력하세요" style={{ ...inputStyle, resize: 'none' as const }} />
        </div>

        <SubmitButton label="등록하기" loadingLabel="등록 중..." />
      </form>
    </div>
  )
}
