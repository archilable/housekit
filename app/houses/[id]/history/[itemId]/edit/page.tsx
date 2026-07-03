import { prisma } from '@/lib/db'
import { updateHistory } from '@/lib/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import HistoryContactForm from '@/app/components/HistoryContactForm'
import SubmitButton from '@/app/components/SubmitButton'
import BackHomeButtons from '@/app/components/BackHomeButtons'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 18, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: 15, color: '#888', display: 'block', marginBottom: 8 }
const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

export default async function EditHistoryPage({ params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { id, itemId } = await params
  const item = await prisma.history.findUnique({ where: { id: itemId } })
  if (!item) notFound()

  const doneAtValue = new Date(item.doneAt).toISOString().split('T')[0]

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <BackHomeButtons houseId={id} />
        <h1 style={{ fontSize: 23, fontWeight: 500, marginTop: 14, marginBottom: 0 }}>이력 수정</h1>
      </div>

      <form action={updateHistory.bind(null, itemId)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <input type="hidden" name="houseId" value={id} />

        <div style={fieldStyle}>
          <label style={labelStyle}>구분 <span style={{ color: '#f87171' }}>*</span></label>
          <select name="category" required defaultValue={item.category} style={{ ...inputStyle, appearance: 'none' as const }}>
            <option value="수리">수리</option>
            <option value="교체">교체</option>
            <option value="점검">점검</option>
            <option value="청소">청소</option>
            <option value="방역">방역</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>제목 <span style={{ color: '#f87171' }}>*</span></label>
          <input name="title" required defaultValue={item.title} style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>상세 내용</label>
          <textarea name="description" rows={3} defaultValue={item.description ?? ''} style={{ ...inputStyle, resize: 'none' as const }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>작업일 <span style={{ color: '#f87171' }}>*</span></label>
          <input name="doneAt" type="date" required defaultValue={doneAtValue} style={{ ...inputStyle, display: "block", overflow: "hidden" }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>비용 (원)</label>
          <input name="cost" type="number" defaultValue={item.cost ?? ''} min="0" style={inputStyle} />
        </div>

        <HistoryContactForm
          defaultName={item.contactName ?? ''}
          defaultPhone={item.contactPhone ?? ''}
          defaultCompany={item.contactCompany ?? ''}
          defaultContactImage={item.contactImageBase64 ?? ''}
          defaultContractImage={item.contractImageBase64 ?? ''}
          defaultEstimateImage={item.estimateImageBase64 ?? ''}
        />

        <SubmitButton label="저장하기" loadingLabel="저장 중..." />
      </form>
    </div>
  )
}
