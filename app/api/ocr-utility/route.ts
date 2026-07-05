import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()

    const prompt = `한국 공과금 고지서 사진입니다. 이번 달 실제 납부할 청구금액만 추출하세요.

규칙:
- "당월요금", "청구금액", "납부할 금액", "이번달 청구액" 중 가장 최종 합산 금액을 선택
- 전월요금, 미납금, 부가세 항목별 세부금액, 누진요금 등 중간 계산값은 제외
- 고지서 한 장에 항목이 하나만 있을 경우 해당 항목에만 값을 넣고 나머지는 null
- 확실하지 않으면 null (틀리게 넣는 것보다 null이 나음)

분류:
- electric: 전기요금/전력요금/한전
- water: 수도요금/상수도/하수도 포함 합계
- gas: 도시가스/가스요금
- telecom: 통신비/인터넷/휴대폰/KT/SKT/LGU+

JSON만 반환 (다른 텍스트 없이):
{"electric":숫자또는null,"water":숫자또는null,"gas":숫자또는null,"telecom":숫자또는null,"memo":"고지서 종류와 청구월 한줄 요약"}`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mediaType || 'image/jpeg'};base64,${imageBase64}` } },
            { type: 'text', text: prompt },
          ],
        }],
        max_tokens: 256,
        temperature: 0.1,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'API 오류')

    const text = data.choices?.[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('파싱 실패')

    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '오류 발생' }, { status: 500 })
  }
}
