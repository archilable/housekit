import { NextRequest, NextResponse } from 'next/server'

async function runValuationAi(address: string, houseType: string, buildYear: number | null, area: number | null, realTrades: any) {
  const age = buildYear ? new Date().getFullYear() - buildYear : null

  let realTradeText = '실거래 데이터 없음'
  if (realTrades && !realTrades.error && realTrades.count > 0) {
    realTradeText = `최근 12개월 ${realTrades.count}건 실거래 기준:
- 최고가: ${(realTrades.max / 100000000).toFixed(1)}억원
- 최저가: ${(realTrades.min / 100000000).toFixed(1)}억원
- 평균가: ${(realTrades.avg / 100000000).toFixed(1)}억원
- 중간가: ${(realTrades.median / 100000000).toFixed(1)}억원`
  }

  const prompt = `당신은 대한민국 부동산 감정평가 전문가입니다. 국토교통부 실거래가 데이터와 주택 정보를 바탕으로 시세를 추정하세요.

[대상 주택 정보]
- 주소: ${address}
- 주택 유형: ${houseType}
- 건축연도: ${buildYear ? buildYear + '년 (경과 ' + age + '년)' : '미상'}
- 면적: ${area ? area + '㎡ (' + Math.round(area * 0.3025) + '평)' : '미상'}

[국토부 실거래가 현황 - 동일 지역 유사 면적]
${realTradeText}

위 실거래 데이터에서 중간가(median)와 평균가(avg)를 최우선 기준으로 삼고, 아래 요소를 추가 반영하여 이 주택의 현재 시세를 추정하세요:
- 건물 노후도 (건축연도 기준 감가)
- 빌라/연립은 아파트 대비 일반적으로 60~75% 수준
- 단독주택은 토지가치 포함 여부 고려
- 최고가/최저가는 이상치일 수 있으므로 중간값 중심으로 추정할 것

다음 JSON 형식으로만 답변하세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "minPrice": 숫자(원 단위),
  "maxPrice": 숫자(원 단위),
  "midPrice": 숫자(원 단위),
  "basis": "실거래 데이터 기반 추정 근거 2~3문장",
  "confidence": "높음 또는 보통 또는 낮음",
  "note": "참고사항 한 문장"
}`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: '당신은 한국 부동산 감정평가 전문가입니다. 제공된 실거래 데이터를 반드시 활용하여 근거 있는 시세를 추정합니다. JSON만 반환합니다.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.2,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'API 오류')

  const text = data.choices?.[0]?.message?.content ?? ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('응답 파싱 실패')

  return JSON.parse(jsonMatch[0])
}

export async function POST(req: NextRequest) {
  try {
    const { address, houseType, buildYear, area } = await req.json()
    const baseUrl = process.env.NEXTAUTH_URL ?? 'https://www.housekit.kr'

    const realRes = await fetch(
      `${baseUrl}/api/realprice?address=${encodeURIComponent(address)}&houseType=${encodeURIComponent(houseType)}&area=${area ?? 0}`,
      { cache: 'no-store' }
    )
    const realTrades = realRes.ok ? await realRes.json() : null
    const result = await runValuationAi(address, houseType, buildYear, area, realTrades)
    return NextResponse.json(result)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '오류 발생' }, { status: 500 })
  }
}
