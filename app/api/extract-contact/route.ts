import { NextRequest, NextResponse } from 'next/server'

const LLM_MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
]

async function ocrExtract(base64Data: string, mediaType: string): Promise<string> {
  const body = new URLSearchParams({
    apikey: process.env.OCR_SPACE_API_KEY!,
    base64Image: `data:${mediaType};base64,${base64Data}`,
    language: 'kor',
    isOverlayRequired: 'false',
    detectOrientation: 'true',
    scale: 'true',
    OCREngine: '2',
  })
  const res = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body,
  })
  const data = await res.json()
  console.log('[OCR response]', JSON.stringify(data).slice(0, 500))
  return data?.ParsedResults?.[0]?.ParsedText ?? ''
}

async function parseWithLLM(ocrText: string): Promise<{ name: string; phone: string; company: string } | null> {
  for (const model of LLM_MODELS) {
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
          content: `다음은 명함에서 OCR로 추출한 텍스트입니다:\n\n${ocrText}\n\n이 텍스트에서 담당자 이름, 전화번호, 회사명을 추출해서 반드시 JSON 형식으로만 답하세요. 없는 항목은 빈 문자열로:\n{"name":"담당자이름","phone":"전화번호","company":"회사/업체명"}`,
        }],
      }),
    })
    const data = await res.json()
    if (data.error) continue
    const text = data.choices?.[0]?.message?.content ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()
    if (!imageBase64) return NextResponse.json({ name: '', phone: '', company: '' }, { status: 400 })

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const detectedType = mediaType || (imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg')

    const ocrText = await ocrExtract(base64Data, detectedType)
    console.log('[extract-contact] OCR text:', ocrText.slice(0, 300))
    if (!ocrText.trim()) return NextResponse.json({ name: '', phone: '', company: '' })

    const contact = await parseWithLLM(ocrText)
    return NextResponse.json(contact ?? { name: '', phone: '', company: '' })
  } catch {
    return NextResponse.json({ name: '', phone: '', company: '' })
  }
}
