import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mediaType || 'image/jpeg'};base64,${imageBase64}` } },
            { type: 'text', text: `이 명함 이미지에서 정보를 추출해주세요. 반드시 아래 JSON 형식으로만 답변하세요. 없는 항목은 빈 문자열로:
{"name":"담당자이름","phone":"전화번호","company":"회사/업체명"}` },
          ],
        }],
        max_tokens: 200,
      }),
    })

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? '{}'
    const match = text.match(/\{[\s\S]*\}/)
    const contact = match ? JSON.parse(match[0]) : {}

    return NextResponse.json(contact)
  } catch {
    return NextResponse.json({ name: '', phone: '', company: '' })
  }
}
