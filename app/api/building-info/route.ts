import { NextRequest, NextResponse } from 'next/server'

const SERVICE_KEY = process.env.PUBLIC_DATA_API_KEY || ''

// 지번주소 파싱: "서울특별시 서대문구 연희동 139-2" → { dong: "연희동", bun: "139", ji: "2" }
function parseJibunAddress(jibunAddress: string) {
  const parts = jibunAddress.trim().split(/\s+/)
  // 마지막이 번지 (예: "139-2" 또는 "139")
  const jibun = parts[parts.length - 1] || ''
  const dong = parts[parts.length - 2] || ''
  const sigungu = parts[parts.length - 3] || ''
  const sido = parts.slice(0, parts.length - 3).join(' ')

  const [bun = '', ji = '0'] = jibun.split('-')
  return { sido, sigungu, dong, bun, ji }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const jibunAddress = searchParams.get('jibunAddress') || ''

  if (!jibunAddress) {
    return NextResponse.json({ error: 'missing jibunAddress' }, { status: 400 })
  }

  const { sido, sigungu, dong, bun, ji } = parseJibunAddress(jibunAddress)

  if (!sido || !sigungu || !dong || !bun) {
    return NextResponse.json({ error: 'parse failed', parsed: { sido, sigungu, dong, bun, ji } }, { status: 400 })
  }

  try {
    const params = new URLSearchParams({
      serviceKey: SERVICE_KEY,
      siDo: sido,
      siGunGu: sigungu,
      eupmyeondong: dong,
      bun,
      ji,
      numOfRows: '10',
      pageNo: '1',
      _type: 'json',
    })

    const url = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?${params}`
    const res = await fetch(url, { cache: 'no-store' })
    const text = await res.text()

    let data: any
    try { data = JSON.parse(text) } catch {
      return NextResponse.json({ error: 'API parse error', raw: text.slice(0, 300) }, { status: 502 })
    }

    // 디버그용 raw 응답 포함
    const items = data?.response?.body?.items?.item ?? data?.body?.items?.item
    if (!items) {
      return NextResponse.json({ error: 'no data', debug: { parsed: { sido, sigungu, dong, bun, ji }, raw: data } }, { status: 404 })
    }

    const list = Array.isArray(items) ? items : [items]
    const item = list[0]

    const buildYear = item.useAprDay ? parseInt(String(item.useAprDay).slice(0, 4)) : null

    const purposeCode = String(item.mainPurpsCdNm || '')
    let houseType = ''
    if (purposeCode.includes('아파트')) houseType = '아파트'
    else if (purposeCode.includes('다세대') || purposeCode.includes('연립')) houseType = '빌라/연립'
    else if (purposeCode.includes('단독')) houseType = '단독주택'
    else if (purposeCode.includes('다가구')) houseType = '다가구'

    return NextResponse.json({
      platArea: item.platArea ? parseFloat(item.platArea) : null,
      archArea: item.archArea ? parseFloat(item.archArea) : null,
      totArea: item.totArea ? parseFloat(item.totArea) : null,
      buildYear,
      houseType,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
