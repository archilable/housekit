import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()

    const prompt = `당신은 한국 공과금 영수증·고지서·문자·앱 알림 전문 분석가입니다.
아래 이미지에서 공과금 납부 정보를 정확하게 추출하세요.

## 사진 종류별 처리

[고지서/영수증]
- "청구금액", "납부할 금액", "당월요금", "고지금액" 중 최종 납부 금액
- 세부 항목(기본요금, 사용요금, 부가세 등) 합산값 말고 최종값 선택

[은행·카드 거래내역]
- 공과금 출금 항목만 (쇼핑·식비 등 무관 항목 무시)
- 입금 말고 출금/지출 금액만
- 같은 항목이 여러 달이면 가장 최근 금액

[문자(SMS)·카카오 알림·앱 푸시 알림]
- "납부완료", "자동납부", "출금완료", "결제완료" 등 납부 확인 문자에서 금액 추출
- 예: "[한전] 전기요금 52,000원 납부완료" → electric: 52000
- 예: "[서울도시가스] 가스요금 38,000원 자동납부" → gas: 38000
- 예: "[KT] 7월 요금 45,900원 출금" → telecom: 45900

## 분류 기준 (절대 혼동 금지)

electric (전기세):
→ 한국전력공사, 한전, KEPCO, 전기요금, 전력요금, [한전]
→ 한국전력공사 = 반드시 electric, 절대 water/gas/telecom 아님

water (수도세):
→ 상수도, 하수도, 상하수도, 수도요금, 서울시상수도, 수자원공사, K-water

gas (가스비):
→ 도시가스, 서울도시가스, 경동도시가스, 대성에너지, 예스코, 부산도시가스, 인천도시가스, 가스요금

telecom (통신비):
→ KT, SKT, SK텔레콤, SK브로드밴드, LGU+, LG유플러스, 알뜰폰, 인터넷, 통신요금, 휴대폰요금

## 규칙
- 한 장의 사진에 여러 공과금이 있을 수 있음 (계좌내역 등)
- 확실하지 않으면 null (오분류가 제일 나쁨)
- 없는 항목은 null
- 금액은 원 단위 정수 (52000 형태, 쉼표 없이)

## 월 추출
- 문자: 날짜에서 추출 (예: "7월" → 현재 연도 기준 "2025-07")
- 고지서: "청구월", "사용월", "납기" 등에서 추출
- "YYYY-MM" 형식, 모르면 null

JSON만 반환 (다른 텍스트 절대 없이):
{"electric":숫자또는null,"water":숫자또는null,"gas":숫자또는null,"telecom":숫자또는null,"month":"YYYY-MM또는null","memo":"인식한 내용 한줄 요약 (예: 한국전력공사 7월 전기요금 52,000원)"}`

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
        max_tokens: 300,
        temperature: 0.0,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'API 오류')

    const text = data.choices?.[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*?\}/)
    if (!jsonMatch) throw new Error('파싱 실패')

    const parsed = JSON.parse(jsonMatch[0])

    // 금액 값 정수 보정
    for (const key of ['electric', 'water', 'gas', 'telecom'] as const) {
      if (parsed[key] !== null && parsed[key] !== undefined) {
        parsed[key] = Math.round(Number(parsed[key]))
        if (isNaN(parsed[key]) || parsed[key] <= 0) parsed[key] = null
      }
    }

    return NextResponse.json(parsed)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '오류 발생' }, { status: 500 })
  }
}
