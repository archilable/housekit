import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { address, houseType, buildYear, area } = await req.json()

    const age = buildYear ? new Date().getFullYear() - buildYear : null

    const prompt = `당신은 한국 부동산 시장 전문가입니다. 아래 주택 정보를 바탕으로 현재 시장 시세를 추정해주세요.

주택 정보:
- 주소: ${address}
- 주택 유형: ${houseType}
- 건축연도: ${buildYear ? buildYear + '년 (' + age + '년 경과)' : '미상'}
- 면적: ${area ? area + '㎡' : '미상'}

다음 JSON 형식으로만 답변해주세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "minPrice": 숫자(원 단위, 최소 추정가),
  "maxPrice": 숫자(원 단위, 최대 추정가),
  "midPrice": 숫자(원 단위, 중간 추정가),
  "basis": "추정 근거 2~3문장 (최근 주변 실거래가, 지역 시세 트렌드 등)",
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
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 512,
        temperature: 0.3,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'API 오류')

    const text = data.choices?.[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('응답 파싱 실패')

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '오류 발생' }, { status: 500 })
  }
}
