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
  const lines = ocrText.split(/\n/).map(l => l.trim()).filter(Boolean)

  // 전화번호 추출
  const phoneMatch = ocrText.match(/(\+?82[-\s]?10[-\s]?\d{3,4}[-\s]?\d{4}|0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}|\d{4}-\d{4})/)
  const phone = phoneMatch ? phoneMatch[0].replace(/\s/g, '-').replace(/--/g, '-') : ''

  // 이메일에서 도메인으로 회사명 추출
  const emailMatch = ocrText.match(/[\w.+-]+@[\w-]+\.[\w.]+/)
  let company = ''
  if (emailMatch) {
    const domain = emailMatch[0].split('@')[1].split('.')[0]
    company = domain
  }

  // 회사명: 주식회사, (주), Inc, Co. 등 패턴
  const companyMatch = ocrText.match(/(주식회사\s*[\w가-힣]+|[\w가-힣]+\s*(?:주식회사|\(주\))|[\w가-힣A-Za-z]+\s*(?:Inc|Co\.|Corp|Ltd)\.?)/)
  if (companyMatch) company = companyMatch[0].trim()

  // 이름: 첫 번째 한글 단어 (2~4글자)
  const nameMatch = ocrText.match(/^([가-힣]{2,4})\b/)
  let name = nameMatch ? nameMatch[1] : ''
  if (!name && lines.length > 0) {
    const firstKorean = lines.find(l => /^[가-힣]{2,4}$/.test(l.trim()))
    if (firstKorean) name = firstKorean.trim()
  }

  return { name, phone, company }
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
