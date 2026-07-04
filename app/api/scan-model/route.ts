import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()
    if (!imageBase64) return NextResponse.json({ error: 'no image' }, { status: 400 })

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const mediaType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-31b-it:free',
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
    const text = data.choices?.[0]?.message?.content ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ brand: null, model: null })
    return NextResponse.json(JSON.parse(match[0]))
  } catch {
    return NextResponse.json({ brand: null, model: null })
  }
}
