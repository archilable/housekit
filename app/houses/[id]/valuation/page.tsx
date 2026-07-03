import { prisma } from '@/lib/db'
import { upsertValuation } from '@/lib/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BackHomeButtons from '@/app/components/BackHomeButtons'

const inputStyle = {
  width: '100%', background: '#1a1a24', border: '0.5px solid #2a2a38',
  borderRadius: 10, padding: '12px 14px', fontSize: 18, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
  display: 'block' as const,
}
const labelStyle = { fontSize: 15, color: '#888', display: 'block', marginBottom: 8 }
const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

export default async function ValuationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const house = await prisma.house.findUnique({ where: { id } })
  if (!house) notFound()
  const v = await prisma.valuation.findUnique({ where: { houseId: id } })

  const isApt = house.houseType === '아파트'
  const buildYear = house.buildYear ?? new Date().getFullYear()
  const age = new Date().getFullYear() - buildYear

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <BackHomeButtons houseId={id} />
        <h1 style={{ fontSize: 23, fontWeight: 500, marginTop: 14, marginBottom: 4 }}>시세 정보 입력</h1>
        <p style={{ fontSize: 16, color: '#666' }}>{house.address}</p>
      </div>

      <form action={upsertValuation} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <input type="hidden" name="houseId" value={id} />

        {isApt ? (
          /* 아파트: 공동주택 공시가격 */
          <div style={{ background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <i className="ti ti-building-skyscraper" style={{ fontSize: 23, color: '#60a5fa' }} />
              <span style={{ fontSize: 18, fontWeight: 500, color: '#60a5fa' }}>공동주택 공시가격</span>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>공동주택 공시가격 (원) <span style={{ color: '#555', fontSize: 14 }}>— 국토부 공시</span></label>
              <input name="officialPrice" type="number" placeholder="350000000" defaultValue={v?.officialPrice ?? ''} style={inputStyle} />
            </div>
            <div style={{ ...fieldStyle, marginTop: 12 }}>
              <label style={labelStyle}>공시가격 반영률 <span style={{ color: '#555', fontSize: 14 }}>— 보통 0.69~0.75</span></label>
              <input name="priceRatio" type="number" step="0.01" placeholder="0.70" defaultValue={v?.priceRatio ?? 0.70} style={inputStyle} />
            </div>
            <input type="hidden" name="landPrice" value="" />
            <input type="hidden" name="landArea" value="" />
            <input type="hidden" name="landShare" value="" />
            <input type="hidden" name="buildCostPerSqm" value="" />
            <input type="hidden" name="buildArea" value="" />
            <input type="hidden" name="deprRate" value="" />
          </div>
        ) : (
          /* 단독/빌라/다가구: 토지 + 건물 */
          <>
            <div style={{ background: '#0d1a2e', border: '0.5px solid #1e3a5f', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <i className="ti ti-map-pin" style={{ fontSize: 23, color: '#fbbf24' }} />
                <span style={{ fontSize: 18, fontWeight: 500, color: '#fbbf24' }}>토지가</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>개별공시지가 (원/㎡) <span style={{ color: '#555', fontSize: 14 }}>— 국토부 부동산공시가격알리미</span></label>
                  <input name="landPrice" type="number" placeholder="2500000" defaultValue={v?.landPrice ?? ''} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>대지면적 (㎡)</label>
                  <input name="landArea" type="number" step="0.1" placeholder="165.0" defaultValue={v?.landArea ?? house.landArea ?? ''} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>지분율 <span style={{ color: '#555', fontSize: 14 }}>— 단독=1.0 / 공동소유시 본인 지분</span></label>
                  <input name="landShare" type="number" step="0.01" min="0.01" max="1" placeholder="1.0" defaultValue={v?.landShare ?? 1.0} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={{ background: '#111118', border: '0.5px solid #1e1e28', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <i className="ti ti-home-2" style={{ fontSize: 23, color: '#a78bfa' }} />
                <span style={{ fontSize: 18, fontWeight: 500, color: '#a78bfa' }}>건물가</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>건축비 단가 (원/㎡) <span style={{ color: '#555', fontSize: 14 }}>— 표준 단가 약 80~150만원</span></label>
                  <input name="buildCostPerSqm" type="number" placeholder="1000000" defaultValue={v?.buildCostPerSqm ?? ''} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>연면적 (㎡)</label>
                  <input name="buildArea" type="number" step="0.1" placeholder="99.0" defaultValue={v?.buildArea ?? house.exclusiveArea ?? house.buildArea ?? ''} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>연 감가율 <span style={{ color: '#555', fontSize: 14 }}>— 일반적으로 0.02 (2%) / 건물 경과 {age}년</span></label>
                  <input name="deprRate" type="number" step="0.001" min="0" max="0.1" placeholder="0.020" defaultValue={v?.deprRate ?? 0.02} style={inputStyle} />
                </div>
              </div>
            </div>
            <input type="hidden" name="officialPrice" value="" />
            <input type="hidden" name="priceRatio" value="" />
          </>
        )}

        {/* 안내 */}
        <div style={{ background: '#111118', borderRadius: 12, padding: 14, fontSize: 15, color: '#555', lineHeight: 1.7 }}>
          <p>💡 공시지가는 <span style={{ color: '#60a5fa' }}>국토부 부동산공시가격알리미</span>에서 확인하세요.</p>
          <p style={{ marginTop: 4 }}>💡 계산된 금액은 참고용 추정치로 실제 시세와 다를 수 있습니다.</p>
        </div>

        <button type="submit" style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 18, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
          저장 및 계산하기
        </button>
      </form>
    </div>
  )
}
