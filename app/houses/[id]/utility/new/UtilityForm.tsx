'use client'
import { useState } from 'react'
import UtilityOCR from '@/app/components/UtilityOCR'

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

interface Props {
  houseId: string
  selectedMonth: string
  months: string[]
  existing: Record<string, number | null> | null
  action: (formData: FormData) => Promise<void>
}

export default function UtilityForm({ houseId, selectedMonth, months, existing, action }: Props) {
  const thisMonth = new Date().toISOString().slice(0, 7)
  const [values, setValues] = useState<Record<string, string>>({
    electric: existing?.electric?.toString() ?? '',
    water: existing?.water?.toString() ?? '',
    gas: existing?.gas?.toString() ?? '',
    telecom: existing?.telecom?.toString() ?? '',
  })

  function handleOCR(data: { electric?: number; water?: number; gas?: number; telecom?: number }) {
    setValues(prev => ({
      electric: data.electric?.toString() ?? prev.electric,
      water: data.water?.toString() ?? prev.water,
      gas: data.gas?.toString() ?? prev.gas,
      telecom: data.telecom?.toString() ?? prev.telecom,
    }))
  }

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input type="hidden" name="houseId" value={houseId} />

      {/* OCR 버튼 */}
      <UtilityOCR onResult={handleOCR} />

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
            {values[name] && (
              <span style={{ fontSize: 11, color: '#34d399', marginLeft: 'auto' }}>✅ 자동입력</span>
            )}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>금액 (원)</label>
            <input
              name={name}
              type="number"
              placeholder={placeholder}
              value={values[name]}
              onChange={e => setValues(prev => ({ ...prev, [name]: e.target.value }))}
              min="0"
              style={{
                ...inputStyle,
                borderColor: values[name] ? '#1a3d28' : '#2a2a38',
              }}
            />
          </div>
        </div>
      ))}

      <button type="submit" style={{ marginTop: 4, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
        저장하기
      </button>
    </form>
  )
}
