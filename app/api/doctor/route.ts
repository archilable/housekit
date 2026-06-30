import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, description } = await req.json()

    const prompt = `당신은 주택 수리 전문가입니다. 사용자가 집의 문제 부위 사진을 보내왔습니다.

사용자 설명: ${description || '없음'}

다음 형식으로 한국어로 답변해주세요:

## 🔍 진단 결과
[문제가 무엇인지 1-2문장으로 설명]

## ⚠️ 심각도
[낮음 / 보통 / 높음 / 긴급] - [이유 한 문장]

## 🔧 수리 방법
[단계별로 간단히 설명, 최대 4단계]

## 🛒 필요한 자재
[필요한 자재 목록, 각 줄에 하나씩, 형식: - 자재명 (예상 가격대)]

## 👷 전문가 필요 여부
[DIY 가능 / 전문가 권장 / 전문가 필수] - [이유]

## 🔗 숨고 검색
[수리 전문가 검색 키워드 1개]`

    const parts: object[] = []
    if (imageBase64) {
      parts.push({ inline_data: { mime_type: mediaType || 'image/jpeg', data: imageBase64 } })
    }
    parts.push({ text: prompt })

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] }),
      }
    )

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error?.message || `API error ${res.status}`)
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '결과를 받지 못했습니다.'
    return NextResponse.json({ result: text })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
