import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()
    if (!imageBase64) return NextResponse.json({ error: 'no image' }, { status: 400 })

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Data } },
              { text: '이 제품 라벨/스티커 이미지에서 브랜드명과 모델명을 추출해줘. JSON 형식으로만 답해: {"brand": "브랜드명", "model": "모델명"}. 찾을 수 없으면 null로.' },
            ],
          }],
        }),
      }
    )

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ brand: null, model: null })
    const result = JSON.parse(match[0])
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ brand: null, model: null })
  }
}
