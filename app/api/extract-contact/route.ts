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
  // 전화번호 추출 (T 1544-7777, +82 10 xxxx, 010-xxxx 등)
  const phoneMatch = ocrText.match(/(?:T\.?\s*)?(\+?82[-\s]?10[-\s]?\d{3,4}[-\s]?\d{4}|0\d{1,2}[-\s.]?\d{3,4}[-\s.]?\d{4}|\d{4}-\d{4})/)
  const phone = phoneMatch ? phoneMatch[1] ?? phoneMatch[0] : ''

  // 이름: 한글 2~4자이면서 영문 이름이 바로 뒤에 오는 패턴 (박규남 gyunam park)
  let name = ''
  const nameWithRoman = ocrText.match(/([가-힣]{2,4})\s+[a-z]{2,}\s+[a-z]{2,}/i)
  if (nameWithRoman) {
    name = nameWithRoman[1]
  } else {
    // 단독 한글 이름 (줄바꿈 전후로 2~4자)
    const nameOnly = ocrText.match(/(?:^|\s)([가-힣]{2,4})(?:\s|$)/)
    if (nameOnly) name = nameOnly[1]
  }

  // 회사명: 첫 번째 의미있는 덩어리 (이름보다 앞에 나오는 경우 많음)
  let company = ''
  // 직함 키워드 앞의 텍스트에서 회사명 찾기
  const beforeTitle = ocrText.match(/^(.+?)(?:대표|팀장|과장|부장|차장|매니저|Manager|Director|CEO|이사|사원|주임|선임|책임|수석|원장|소장|실장|본부장)/i)
  if (beforeTitle) {
    company = beforeTitle[1]
      .replace(name, '')
      .replace(/[a-z]+\s+[a-z]+/gi, '') // 영문 로마자 표기 제거
      .trim().replace(/\s+/g, ' ')
  }
  if (!company) {
    // 이메일 도메인에서 회사명
    const emailMatch = ocrText.match(/[\w.+-]+@([\w-]+)\./)
    if (emailMatch) company = emailMatch[1]
  }
  if (!company) {
    // 첫 줄을 회사명으로
    const firstLine = ocrText.split(/\s{2,}|\n/)[0].replace(name, '').trim()
    if (firstLine.length > 1) company = firstLine
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
