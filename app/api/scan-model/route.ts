import { NextRequest, NextResponse } from 'next/server'

const MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
]

async function tryModel(model: string, mediaType: string, base64Data: string): Promise<string | null> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64Data}` } },
          { type: 'text', text: '이 제품 라벨/스티커 이미지에서 브랜드명과 모델명을 추출해줘. JSON 형식으로만 답해: {"brand": "브랜드명", "model": "모델명"}. 찾을 수 없으면 null로.' },
        ],
      }],
    }),
  })
  const data = await res.json()
  if (data.error) return null
  return data.choices?.[0]?.message?.content ?? null
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()
    if (!imageBase64) return NextResponse.json({ error: 'no image' }, { status: 400 })

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const mediaType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'

    for (const model of MODELS) {
      const text = await tryModel(model, mediaType, base64Data)
      if (text) {
        const match = text.match(/\{[\s\S]*\}/)
        if (!match) continue
        return NextResponse.json(JSON.parse(match[0]))
      }
    }

    return NextResponse.json({ brand: null, model: null })
  } catch {
    return NextResponse.json({ brand: null, model: null })
  }
}
