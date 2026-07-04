import { NextRequest, NextResponse } from 'next/server'

const MODELS = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'google/gemma-4-26b-a4b-it:free',
]

async function tryModel(model: string, detectedType: string, base64Data: string): Promise<string | null> {
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
          { type: 'image_url', image_url: { url: `data:${detectedType};base64,${base64Data}` } },
          { type: 'text', text: '이 명함 이미지에서 정보를 추출해주세요. 반드시 아래 JSON 형식으로만 답변하세요. 없는 항목은 빈 문자열로:\n{"name":"담당자이름","phone":"전화번호","company":"회사/업체명"}' },
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
    const { imageBase64, mediaType } = await req.json()
    if (!imageBase64) return NextResponse.json({ name: '', phone: '', company: '' }, { status: 400 })

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const detectedType = mediaType || (imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg')

    for (const model of MODELS) {
      const text = await tryModel(model, detectedType, base64Data)
      if (text) {
        const match = text.match(/\{[\s\S]*\}/)
        const contact = match ? JSON.parse(match[0]) : {}
        return NextResponse.json(contact)
      }
    }

    return NextResponse.json({ name: '', phone: '', company: '' })
  } catch {
    return NextResponse.json({ name: '', phone: '', company: '' })
  }
}
