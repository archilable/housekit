import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, description, houseId } = await req.json()

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

    const messages: object[] = []

    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mediaType || 'image/jpeg'};base64,${imageBase64}` } },
          { type: 'text', text: prompt },
        ],
      })
    } else {
      messages.push({ role: 'user', content: prompt })
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: imageBase64 ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1024,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || `API error ${res.status}`)

    const text = data.choices?.[0]?.message?.content ?? '결과를 받지 못했습니다.'

    // 진단 이력 저장
    if (houseId) {
      await prisma.doctorHistory.create({
        data: {
          houseId,
          description: description || null,
          imageBase64: imageBase64 ? imageBase64.slice(0, 2000) : null, // 썸네일용 일부만 저장
          result: text,
        },
      })
    }

    return NextResponse.json({ result: text })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
