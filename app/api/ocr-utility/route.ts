import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()

    const prompt = `한국 공과금 고지서 또는 은행/카드 거래내역 사진입니다. 아래 규칙에 따라 정확하게 분류하세요.

## 분류 기준 (이것이 가장 중요)

electric (전기세)만 해당:
- 한국전력공사, 한전, KEPCO, 전기요금, 전력요금
- 절대로 수도/가스/통신이 아님

water (수도세)만 해당:
- 상수도, 하수도, 상하수도, 수도요금, 서울시상수도사업본부, 지방상수도

gas (가스비)만 해당:
- 도시가스, 서울도시가스, 대성에너지, 경동도시가스, 예스코, 부산도시가스, 가스요금

telecom (통신비)만 해당:
- KT, SKT, SK텔레콤, LGU+, LG유플러스, 인터넷, 휴대폰, 통신요금

## 금액 추출 규칙
- 고지서: "청구금액", "납부할 금액", "당월요금" 중 최종 납부액
- 계좌·카드 내역: 출금/지출 금액만 (입금 제외), 가장 최근 거래

## 중요
- 한국전력공사 고지서 → electric에만 입력, water/gas/telecom은 반드시 null
- 확실하지 않으면 null (틀리게 넣는 것보다 null이 훨씬 나음)
- 고지서에 없는 항목은 null

## 월 형식
- "YYYY-MM" (예: "2025-06"), 모르면 null

JSON만 반환 (다른 텍스트 절대 없이):
{"electric":숫자또는null,"water":숫자또는null,"gas":숫자또는null,"telecom":숫자또는null,"month":"YYYY-MM또는null","memo":"인식한 고지서 종류와 금액 한줄 요약"}`

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
