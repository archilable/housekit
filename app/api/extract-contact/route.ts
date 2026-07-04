import { NextRequest, NextResponse } from 'next/server'


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

function parseContact(ocrText: string): { name: string; phone: string; company: string } {
  // 1. 전화번호
  const phoneMatch = ocrText.match(/\+?82[-\s]?10[-\s]?\d{3,4}[-\s]?\d{4}|0\d{1,2}[-\s.]?\d{3,4}[-\s.]?\d{4}|\d{4}-\d{4}/)
  const phone = phoneMatch ? phoneMatch[0] : ''

  // 2. 이름: 한글 2~4자 뒤에 소문자 로마자가 오는 패턴 우선 (박규남 gyunam park)
  let name = ''
  let nameIndex = ocrText.length
  const nameRoman = ocrText.match(/([가-힣]{2,4})\s+[a-z]{2,}\s+[a-z]{2,}/)
  if (nameRoman && nameRoman.index !== undefined) {
    name = nameRoman[1]
    nameIndex = nameRoman.index
  } else {
    // 단독 한글 이름
    const nameAlone = ocrText.match(/([가-힣]{2,4})(?=\s|$)/)
    if (nameAlone && nameAlone.index !== undefined) {
      name = nameAlone[1]
      nameIndex = nameAlone.index
    }
  }

  // 3. 회사명: 이름이 등장하기 전 텍스트
  let company = ''
  if (nameIndex > 0) {
    company = ocrText.slice(0, nameIndex).trim().replace(/[|\s]+$/, '').trim()
  }
  // 이메일 도메인으로 보완
  if (!company) {
    const emailMatch = ocrText.match(/[\w.+-]+@([\w-]+)\./)
    if (emailMatch) company = emailMatch[1]
  }

  return { name, phone, company: company.replace(/\s+/g, ' ').trim() }
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

    const contact = parseContact(ocrText)
    return NextResponse.json(contact)
  } catch {
    return NextResponse.json({ name: '', phone: '', company: '' })
  }
}
