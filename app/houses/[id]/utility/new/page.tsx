import { upsertUtility } from '@/lib/actions'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import BackHomeButtons from '@/app/components/BackHomeButtons'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
  display: 'block' as const,
}
const labelStyle = { fontSize: 12, color: '#888', display: 'block', marginBottom: 8 }
const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

const UTILITY_ITEMS = [
  { name: 'electric', label: '전기세', icon: 'ti-bolt', color: '#fbbf24', placeholder: '65000' },
  { name: 'water',    label: '수도세', icon: 'ti-droplet', color: '#60a5fa', placeholder: '22000' },
  { name: 'gas',      label: '가스비', icon: 'ti-flame', color: '#f97316', placeholder: '48000' },
  { name: 'telecom',  label: '통신비', icon: 'ti-wifi', color: '#34d399', placeholder: '89000' },
]

// 최근 24개월 목록 생성
function getMonthOptions() {
  const months = []
  const d = new Date()
  for (let i = 0; i < 24; i++) {
    months.push(d.toISOString().slice(0, 7))
    d.setMonth(d.getMonth() - 1)
  }
  return months
}

export default async function NewUtilityPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ month?: string }>
}) {
  const { id } = await params
  const { month: qMonth } = await searchParams
  const thisMonth = new Date().toISOString().slice(0, 7)
  const selectedMonth = qMonth || thisMonth

  // 기존 데이터 불러오기
  const existing = await prisma.utility.findUnique({ where: { houseId_month: { houseId: id, month: selectedMonth } } })
  const months = getMonthOptions()

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <BackHomeButtons houseId={id} />
        <h1 style={{ fontSize: 20, fontWeight: 500, marginTop: 14, marginBottom: 0 }}>공과금 입력</h1>
      </div>

      <form action={upsertUtility} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input type="hidden" name="houseId" value={id} />

        {/* 월 선택 */}
        <div style={fieldStyle}>
          <label style={labelStyle}>청구월 선택</label>
          <select name="month" defaultValue={selectedMonth} style={{ ...inputStyle, appearance: 'none' as const }}>
            {months.map(m => (
              <option key={m} value={m}>
                {m.replace('-', '년 ')}월{m === thisMonth ? ' (이번달)' : ''}
              </option>
            ))}
          </select>
        </div>

        {UTILITY_ITEMS.map(({ name, label, icon, color, placeholder }) => (
          <div key={name} style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${icon}`} style={{ fontSize: 16, color }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{label}</span>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>금액 (원)</label>
              <input
                name={name}
                type="number"
                placeholder={placeholder}
                defaultValue={(existing as Record<string, unknown>)?.[name] as number ?? ''}
                min="0"
                style={inputStyle}
              />
            </div>
          </div>
        ))}

        <button type="submit" style={{ marginTop: 4, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
          저장하기
        </button>
      </form>
    </div>
  )
}
