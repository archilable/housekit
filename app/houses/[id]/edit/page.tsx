import { prisma } from '@/lib/db'
import { updateHouse } from '@/lib/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AddressSearch from '@/app/components/AddressSearch'
import SubmitButton from '@/app/components/SubmitButton'
import BackHomeButtons from '@/app/components/BackHomeButtons'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
  display: 'block' as const,
}
const labelStyle = { fontSize: 12, color: '#888', display: 'block', marginBottom: 8 }
const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i)

export default async function EditHousePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const house = await prisma.house.findUnique({ where: { id } })
  if (!house) notFound()

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <BackHomeButtons houseId={id} />
        <h1 style={{ fontSize: 20, fontWeight: 500, marginTop: 14, marginBottom: 0 }}>주택 정보 수정</h1>
      </div>

      <form action={updateHouse.bind(null, id)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>주소 <span style={{ color: '#f87171' }}>*</span></label>
          <AddressSearch defaultAddress={house.address} defaultAddressDetail={house.addressDetail ?? ''} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>주택 유형 <span style={{ color: '#f87171' }}>*</span></label>
          <select name="houseType" required defaultValue={house.houseType} style={{ ...inputStyle, appearance: 'none' as const }}>
            <option value="단독주택">단독주택</option>
            <option value="빌라/연립">빌라 / 연립</option>
            <option value="다가구">다가구</option>
            <option value="아파트">아파트</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>건축연도</label>
          <select name="buildYear" defaultValue={house.buildYear ?? ''} style={{ ...inputStyle, appearance: 'none' as const }}>
            <option value="">선택하세요</option>
            {years.map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>대지면적 (㎡)</label>
          <input name="landArea" type="number" defaultValue={house.landArea ?? ''} step="0.1" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>건축면적 (㎡)</label>
          <input name="buildArea" type="number" defaultValue={house.buildArea ?? ''} step="0.1" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>전용면적 / 실면적 (㎡)</label>
          <input name="exclusiveArea" type="number" defaultValue={house.exclusiveArea ?? ''} step="0.1" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>소유자 이름</label>
          <input name="ownerName" defaultValue={house.ownerName ?? ''} style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>메모</label>
          <textarea name="notes" rows={3} defaultValue={house.notes ?? ''} style={{ ...inputStyle, resize: 'none' as const }} />
        </div>

        <SubmitButton label="저장하기" loadingLabel="저장 중..." />
      </form>
    </div>
  )
}
