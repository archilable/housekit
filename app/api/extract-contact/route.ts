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

const TITLE_KEYWORDS = '대표|팀장|과장|부장|차장|매니저|이사|사원|주임|선임|책임|수석|원장|소장|실장|본부장|Director|Manager|CEO|Designer'

function parseContact(ocrText: string): { name: string; phone: string; company: string } {
  // 1. 전화번호
  const phoneMatch = ocrText.match(/\+?82[-\s]?10[-\s]?\d{3,4}[-\s]?\d{4}|0\d{1,2}[-\s.]?\d{3,4}[-\s.]?\d{4}|\d{4}-\d{4}/)
  const phone = phoneMatch ? phoneMatch[0] : ''

  // 2. 이름: 로마자 표기 패턴 우선 (박규남 gyunam park), 없으면 직함 앞 한글
  let name = ''
  let nameIndex = -1
  const nameRoman = ocrText.match(/([가-힣]{2,4})\s+[a-z]{2,}\s+[a-z]{2,}/)
  if (nameRoman && nameRoman.index !== undefined) {
    name = nameRoman[1]
    nameIndex = nameRoman.index
  } else {
    // 직함 바로 앞 한글 (공백 합치기 — 김시 현 → 김시현)
    const titleMatch = ocrText.match(new RegExp(`([가-힣][가-힣\\s]{1,8})\\s+(${TITLE_KEYWORDS})`, 'i'))
    if (titleMatch && titleMatch.index !== undefined) {
      name = titleMatch[1].replace(/\s/g, '').trim()
      nameIndex = titleMatch.index
    }
  }

  // 3. 회사명: 이름 등장 전 텍스트 OR 이름 뒤 짧은 영문 단어
  let company = ''
  if (nameIndex > 0) {
    company = ocrText.slice(0, nameIndex).trim().replace(/[|\s]+$/, '').trim()
  }
  // 회사명이 이름 뒤에 있는 경우 (anycar 같은 짧은 영문 브랜드)
  if (!company || company.length < 2) {
    const brandMatch = ocrText.match(/\b([A-Za-z가-힣][A-Za-z가-힣]{1,15})\s+(?:애니|서비스|센터|그룹|코리아)/)
    if (brandMatch) company = brandMatch[1]
  }
  if (!company || company.length < 2) {
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
