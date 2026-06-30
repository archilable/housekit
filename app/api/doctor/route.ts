import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

    const content: Anthropic.MessageParam['content'] = imageBase64
      ? [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 },
          },
          { type: 'text', text: prompt },
        ]
      : [{ type: 'text', text: prompt }]

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ result: text })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
