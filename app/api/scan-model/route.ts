import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json()
  if (!imageBase64) return NextResponse.json({ error: 'no image' }, { status: 400 })

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
  const mediaType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64Data },
        },
        {
          type: 'text',
          text: '이 제품 라벨/스티커 이미지에서 브랜드명과 모델명을 추출해줘. JSON 형식으로만 답해: {"brand": "브랜드명", "model": "모델명"}. 찾을 수 없으면 null로.',
        },
      ],
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return NextResponse.json({ brand: null, model: null })

  try {
    const result = JSON.parse(match[0])
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ brand: null, model: null })
  }
}
