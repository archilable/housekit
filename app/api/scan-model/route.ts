import { NextRequest, NextResponse } from 'next/server'

const MODELS = [
  'google/gemini-2.0-flash-lite',
  'google/gemini-flash-1.5-8b',
  'meta-llama/llama-3.2-11b-vision-instruct:free',
  'qwen/qwen2.5-vl-72b-instruct:free',
]

async function tryModel(model: string, mediaType: string, base64Data: string): Promise<string | null> {
  try {
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
            { type: 'text', text: '이 가전제품/설비 라벨 이미지에서 제조사(브랜드)명과 모델 번호를 찾아줘. 라벨에 적힌 텍스트를 정확히 읽어. JSON 형식으로만 답해(다른 텍스트 없이): {"brand": "브랜드명", "model": "모델번호"}. 찾을 수 없는 항목은 null로.' },
          ],
        }],
      }),
    })
    const data = await res.json()
    if (data.error) {
      console.warn(`[scan-model] ${model} error:`, data.error)
      return null
    }
    return data.choices?.[0]?.message?.content ?? null
  } catch (e) {
    console.warn(`[scan-model] ${model} exception:`, e)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()
    if (!imageBase64) return NextResponse.json({ error: 'no image' }, { status: 400 })

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const mediaType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'

    for (const model of MODELS) {
      const text = await tryModel(model, mediaType, base64Data)
      if (!text) continue
      const match = text.match(/\{[\s\S]*?\}/)
      if (!match) continue
      try {
        const parsed = JSON.parse(match[0])
        if (parsed.brand || parsed.model) {
          console.log(`[scan-model] success with ${model}:`, parsed)
          return NextResponse.json(parsed)
        }
      } catch {
        continue
      }
    }

    return NextResponse.json({ brand: null, model: null })
  } catch (e) {
    console.error('[scan-model] fatal:', e)
    return NextResponse.json({ brand: null, model: null })
  }
}
