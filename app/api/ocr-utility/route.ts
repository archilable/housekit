import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()

    const prompt = `이것은 한국의 공과금 고지서 또는 카드/계좌 내역 사진입니다.

사진에서 아래 항목의 금액을 찾아 JSON으로만 반환하세요. 해당 항목이 없으면 null로 표시하세요.

{
  "electric": 숫자 또는 null,
  "water": 숫자 또는 null,
  "gas": 숫자 또는 null,
  "telecom": 숫자 또는 null,
  "memo": "사진에서 읽은 내용 한줄 요약"
}

주의:
- 금액은 원 단위 숫자만 (예: 65000)
- 전기요금/전력요금 → electric
- 수도요금/상수도 → water
- 도시가스/가스요금 → gas
- 통신비/인터넷/휴대폰 → telecom
- JSON 외 다른 텍스트 절대 포함하지 말것`

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
