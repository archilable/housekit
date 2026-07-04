export const dynamic = 'force-dynamic'

import { createHistory } from '@/lib/actions'
import { prisma } from '@/lib/db'
import BackHomeButtons from '@/app/components/BackHomeButtons'
import HistoryContactForm from '@/app/components/HistoryContactForm'
import SubmitButton from '@/app/components/SubmitButton'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 17, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: 14, color: '#888', display: 'block', marginBottom: 8 }
const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

export default async function NewHistoryPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ title?: string; category?: string; inventoryId?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const today = new Date().toISOString().split('T')[0]

  const inventories = await prisma.inventory.findMany({
    where: { houseId: id },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, category: true, brand: true },
  })

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <BackHomeButtons houseId={id} />
        <h1 style={{ fontSize: 22, fontWeight: 500, marginTop: 14, marginBottom: 0 }}>이력 추가</h1>
      </div>

      <form action={createHistory} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <input type="hidden" name="houseId" value={id} />

        <div style={fieldStyle}>
          <label style={labelStyle}>관련 설비</label>
          <select name="inventoryId" defaultValue={sp.inventoryId ?? ''} style={{ ...inputStyle, appearance: 'none' as const }}>
            <option value="">설비 선택 (선택사항)</option>
            {inventories.map(inv => (
              <option key={inv.id} value={inv.id}>
                [{inv.category}] {inv.name}{inv.brand ? ` · ${inv.brand}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>구분 <span style={{ color: '#f87171' }}>*</span></label>
          <select name="category" required defaultValue={sp.category ?? ''} style={{ ...inputStyle, appearance: 'none' as const }}>
            <option value="">선택하세요</option>
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
          <input name="title" required placeholder="보일러 수리, 누수 점검 등" defaultValue={sp.title ?? ''} style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>상세 내용</label>
          <textarea name="description" rows={3} placeholder="작업 내용을 자세히 기록하세요" style={{ ...inputStyle, resize: 'none' as const }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>작업일 <span style={{ color: '#f87171' }}>*</span></label>
          <input name="doneAt" type="date" required defaultValue={today} style={{ ...inputStyle, display: 'block', overflow: 'hidden' }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>비용 (원)</label>
          <input name="cost" type="number" placeholder="150000" min="0" style={inputStyle} />
        </div>

        <HistoryContactForm />

        <SubmitButton label="저장하기" loadingLabel="저장 중..." />
      </form>
    </div>
  )
}
