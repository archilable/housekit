import { createInventory } from '@/lib/actions'
import Link from 'next/link'
import ContactForm from '@/app/components/ContactForm'
import SubmitButton from '@/app/components/SubmitButton'
import BackHomeButtons from '@/app/components/BackHomeButtons'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: 12, color: '#888', display: 'block', marginBottom: 8 }
const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

export default async function NewInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <BackHomeButtons houseId={id} />
        <h1 style={{ fontSize: 20, fontWeight: 500, marginTop: 14, marginBottom: 0 }}>설비 추가</h1>
      </div>

      <form action={createInventory} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <input type="hidden" name="houseId" value={id} />

        <div style={fieldStyle}>
          <label style={labelStyle}>카테고리 <span style={{ color: '#f87171' }}>*</span></label>
          <select name="category" required style={{ ...inputStyle, appearance: 'none' as const }}>
            <option value="">선택하세요</option>
            <option value="보일러">보일러</option>
            <option value="에어컨">에어컨</option>
            <option value="정수기">정수기</option>
            <option value="냉장고">냉장고</option>
            <option value="세탁기">세탁기</option>
            <option value="건조기">건조기</option>
            <option value="도어락">도어락</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>설비명 <span style={{ color: '#f87171' }}>*</span></label>
          <input name="name" required placeholder="거실 에어컨" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>브랜드</label>
          <input name="brand" placeholder="삼성, LG 등" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>모델명</label>
          <input name="model" placeholder="AF17TX700HFH" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>설치일</label>
          <input name="installedAt" type="date" style={{ ...inputStyle, display: "block", overflow: "hidden" }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>보증기간 (개월)</label>
          <input name="warrantyMonths" type="number" placeholder="24" min="1" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>메모</label>
          <textarea name="notes" rows={3} placeholder="추가 정보" style={{ ...inputStyle, resize: 'none' as const }} />
        </div>

        <ContactForm />

        <SubmitButton label="추가하기" loadingLabel="저장 중..." />
      </form>
    </div>
  )
}
