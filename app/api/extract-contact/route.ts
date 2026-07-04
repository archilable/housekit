import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()
    if (!imageBase64) return NextResponse.json({ name: '', phone: '', company: '' }, { status: 400 })

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const mimeType = mediaType || 'image/jpeg'

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Data } },
              { text: '이 명함 이미지에서 정보를 추출해주세요. 반드시 아래 JSON 형식으로만 답변하세요. 없는 항목은 빈 문자열로:\n{"name":"담당자이름","phone":"전화번호","company":"회사/업체명"}' },
            ],
          }],
        }),
      }
    )

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    console.log('[extract-contact] Gemini raw:', text)
    const match = text.match(/\{[\s\S]*\}/)
    const contact = match ? JSON.parse(match[0]) : {}

    return NextResponse.json(contact)
  } catch (e) {
    console.error('[extract-contact] error:', e)
    return NextResponse.json({ name: '', phone: '', company: '' })
  }
}
