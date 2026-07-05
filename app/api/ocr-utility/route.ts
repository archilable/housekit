import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()

    const prompt = `한국 공과금 고지서 또는 은행/카드 거래내역 사진입니다. 공과금 납부 금액만 추출하세요.

[고지서 사진인 경우]
- "당월요금", "청구금액", "납부할 금액" 중 최종 합산액 선택
- 전월요금, 부가세 세부항목, 누진요금 등 중간값 제외

[계좌·카드 내역 사진인 경우]
- 공과금 관련 항목만 찾을 것 (쇼핑, 식비 등 무관한 거래 무시)
- 동일 업체 거래가 여러 달 있으면 가장 최근 거래 금액 사용
- 출금/지출 금액 기준 (입금 아님)

분류 기준:
- electric: 한국전력/한전/전기요금
- water: 서울시상수도/수도요금/상하수도
- gas: 도시가스/서울도시가스/경동가스
- telecom: KT/SKT/LGU+/SK텔레콤/통신요금/인터넷/휴대폰

규칙:
- 확실하지 않으면 null (틀리게 넣는 것보다 null이 나음)
- 고지서/내역에 없는 항목은 null

JSON만 반환 (다른 텍스트 없이):
{"electric":숫자또는null,"water":숫자또는null,"gas":숫자또는null,"telecom":숫자또는null,"memo":"사진 종류와 추출 내용 한줄 요약"}`

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
